import { GuildSettingsType } from '#types';
import { Logger } from '@/config/LoggerLoader';
import { GuildSettingsTemplate } from '@/config/templates';
import { MongoClient } from '@/Main';
import { GuildSettingsManager, handle_error } from '@/tools';

class _GuildSettingsLoader {
  /** @description Load and cache settings for defined guild */
  async load(guild_id: string) {
    const settings = await this._get_settings(guild_id);

    const filled_settings = Object.assign(GuildSettingsTemplate, settings);
    return new GuildSettingsManager(filled_settings);
  }

  private async _get_settings(guild_id: string): Promise<GuildSettingsType> {
    const db = MongoClient.db(guild_id);
    Logger.log(`Initiating settings for server ${guild_id}`);

    const GuildSettingsCollection = db.collection('GuildSettings');
    const settings_data =
      await GuildSettingsCollection.findOne<GuildSettingsType>({
        guild_id,
      });

    if (!settings_data) {
      Logger.log(`Settings for ${guild_id} do not exist!. Setting up...`);

      await GuildSettingsCollection.insertOne({
        guild_id,
        ...GuildSettingsTemplate,
      }).catch((err) =>
        handle_error(err, '[GuildSettingsLoader] _get_settings')
      );
      Logger.log(`First settings for ${guild_id} successfully set!`);
    }

    Logger.log(`Loaded and exported settings for ${guild_id}`);

    return settings_data || GuildSettingsTemplate;
  }
}

export const GuildSettingsLoader = new _GuildSettingsLoader();
