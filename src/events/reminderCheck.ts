import config from '#config';
import { MongoClient, client } from '@/Main';
import { HandleError, Ready } from '@/decorators';
import { GiveawayController } from '@/tools';
import { Guild } from 'discord.js';

@Ready()
class Event extends GiveawayController {
  constructor() {
    const guild = client.guilds.cache.get(config.guild_id) as Guild;
    super(guild);
    this.execute();
  }

  @HandleError()
  execute() {
    setInterval(this._checkReminders.bind(this), 30000);
    console.log('Check giveaway interval successfuly setted up'.green);
  }

  async _checkReminders() {}
}
