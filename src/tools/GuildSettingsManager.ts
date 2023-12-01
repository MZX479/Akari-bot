import { GuildSettingsType } from '#types';
import { GuildSettingsTemplate } from '@/config/templates';
import { HandleErrorAsync, HandleErrorSecondary } from '@/decorators';

/** @description Settings manager for current guild */
export class GuildSettingsManager {
  private _settings: GuildSettingsType;

  constructor(settings: GuildSettingsType) {
    this._settings = Object.assign(GuildSettingsTemplate, settings);
  }

  /** @description Get permissions for slash commands for current guild */
  @HandleErrorSecondary()
  get_slash_permissions() {
    return this._settings.commands_permissions?.slash;
  }

  /** @description Get permissions for context commands for current guild */
  @HandleErrorSecondary()
  get_context_permissions() {
    return this._settings.commands_permissions?.context;
  }

  /** @description Get permissions for message commands for current guild */
  @HandleErrorSecondary()
  get_message_permissions() {
    return this._settings.commands_permissions?.context;
  }

  @HandleErrorSecondary()
  get_currency_icon() {
    return this._settings.currency_icon;
  }

  @HandleErrorSecondary()
  get_gem_icon() {
    return this._settings.gem_icon;
  }
}
