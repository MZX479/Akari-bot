import config from '#config';
import { DbNote } from '#types';
import { HandleError, HandleErrorSecondaryAsync, Ready } from '@/decorators';
import { client, MongoClient } from '@/Main';
import { ModerationController } from '@/tools/ModerationController';
import { Colors, EmbedBuilder, Guild } from 'discord.js';

@Ready()
class Event extends ModerationController {
  constructor() {
    const guild = client.guilds.cache.get(config.guild_id) as Guild;
    super(guild);
    this.execute();
  }

  @HandleError()
  execute() {
    setInterval(this._checkMutes.bind(this), 60000);
    console.log('Unmute interval successfuly setted up'.green);
  }

  @HandleErrorSecondaryAsync()
  async _checkMutes() {
    const guild = client.guilds.cache.get(config.guild_id) as Guild;

    const me = guild.members.me;

    const unmuteEmbed = new EmbedBuilder()
      .setColor(Colors.Red)
      .setTitle('You have been unmuted on Karuta Hangout!')
      .addFields(
        { name: 'Moderator', value: `<@${me!.user.username}>` },
        { name: 'Reason', value: `\`Time of mute expired!\`` }
      )
      .setTimestamp(new Date());

    const targetsDb = await MongoClient.db('moderation')
      .collection<DbNote>('Moderation')
      .find({
        content: {
          violations: [
            {
              type: 'mute',
              timeOfPunishment: {
                $lt: new Date().getTime(),
              },
            },
          ],
        },
      })
      .toArray();

    for (const mute of targetsDb) {
      if (!guild) continue;

      const member = await guild.members
        .fetch(mute.target!)
        .catch(() => undefined);
      if (!member) continue;

      if (!me) continue;

      await this.unmute(member, unmuteEmbed);
    }
  }
}
