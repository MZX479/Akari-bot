import { GuildSettingsLoader } from '@/loaders';
import { GuildSettingsManager } from './GuildSettingsManager';
import { HandleErrorSecondaryAsync } from '@/decorators';

export class InteractionGuildsSettingsManager {
  protected _settings: GuildSettingsManager | null = null;
  protected _guild_id: string;

  constructor(guild_id: string) {
    this._guild_id = guild_id;
  }

  @HandleErrorSecondaryAsync()
  async json() {
    return this._settings || this.load();
  }

  @HandleErrorSecondaryAsync()
  async load() {
    this._settings = await GuildSettingsLoader.load(this._guild_id);
    return this._settings;
  }

  @HandleErrorSecondaryAsync()
  async currency_icon() {
    const settings = this._settings || (await this.load());
    return settings.get_currency_icon();
  }

  @HandleErrorSecondaryAsync()
  async currency_gem_icon() {
    const settings = this._settings || (await this.load());
    return settings.get_gem_icon();
  }

  @HandleErrorSecondaryAsync()
  async slash_permissions() {
    const settings = this._settings || (await this.load());
    return settings.get_slash_permissions();
  }

  @HandleErrorSecondaryAsync()
  async context_permissions() {
    const settings = this._settings || (await this.load());
    return settings.get_context_permissions();
  }

  @HandleErrorSecondaryAsync()
  async message_permissions() {
    const settings = this._settings || (await this.load());
    return settings.get_message_permissions();
  }
}
