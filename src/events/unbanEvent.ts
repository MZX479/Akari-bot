import config from '#config';
import { DbNote } from '#types';
import { HandleError, HandleErrorSecondaryAsync, Ready } from '@/decorators';
import { client, MongoClient } from '@/Main';
import { ModerationController } from '@/tools/ModerationController';
import { Guild } from 'discord.js';

@Ready()
class Event extends ModerationController {
  constructor() {
    const guild = client.guilds.cache.get(config.guild_id) as Guild;
    super(guild);
    this.execute();
  }

  @HandleError()
  execute() {
    setInterval(this._checkBans.bind(this), 60000);
    console.log('Unban interval successfuly setted up'.green);
  }

  @HandleErrorSecondaryAsync()
  async _checkBans() {
    const guild = client.guilds.cache.get(config.guild_id) as Guild;

    const targetsDb = await MongoClient.db('moderation')
      .collection<DbNote>('Moderation')
      .find({
        content: {
          violations: [
            {
              type: 'ban',
              timeOfPunishment: {
                $lt: new Date().getTime(),
              },
            },
          ],
        },
      })
      .toArray();

    for (const ban of targetsDb) {
      if (!guild) continue;

      const me = guild.members.me;

      const member = await guild.members
        .fetch(ban.target!)
        .catch(() => undefined);
      if (!member) continue;

      if (!me) continue;

      await this.unban(member, 'Time of ban expired');
    }
  }
}
