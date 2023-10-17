import { ObjectId } from 'mongodb';
import {
  ActionRowBuilder,
  ButtonBuilder,
  CommandInteraction,
  EmbedBuilder,
  GuildMember,
  PermissionResolvable,
  SlashCommandBuilder,
  User,
} from 'discord.js';

export type CustomError = Error & { from: string[] };

type GuildSettingsCommandsType = 'slash' | 'context' | 'message';

type GuildSettingsCommandsPermissionsType = {
  [command_type in GuildSettingsCommandsType]?: {
    [command_name: string]: {
      allowed_roles?: string[];
      restricted_roles?: string[];
    };
  };
};

export type DecoratedClassProperties = {
  __error_handle_name?: string;
};
export type DecoratedClassType<This, Args extends any[]> = new (
  ...args: Args
) => This & DecoratedClassProperties;

export type GuildSettingsType = {
  guild_id?: string;
  commands_permissions?: GuildSettingsCommandsPermissionsType;
  currency_icon: string;
  mute_role?: string;
  gem_icon: string;
};

const _to_json = new SlashCommandBuilder().toJSON;

export type SlashDecoratorDataType = ReturnType<typeof _to_json>;

export type SlashDecoratorPermissionsType = {
  allowed_roles?: string[];
  permissions?: PermissionResolvable[];
  restricted_roles?: string[];
};

export type SlashDecoratorArgsType = {
  data: SlashDecoratorDataType;
  permissions?: SlashDecoratorPermissionsType;
  dev_permissions?: SlashDecoratorPermissionsType;
  type: CommandModuleType;
  disabled?: boolean;
  dev_disabled?: boolean;
};

export interface SlashDecoratorPlate {
  data?: SlashDecoratorDataType;
  dev_permissions?: SlashDecoratorPermissionsType | undefined;
  permissions?: SlashDecoratorPermissionsType | undefined;

  new (interaction: CommandInteraction): {};
}

export type SlashLoaderCommandType = {
  command: SlashDecoratorPlate;
  payload: SlashDecoratorArgsType;
};

export type PageWithComponentsType = {
  page: EmbedBuilder;
  components?: ActionRowBuilder;
  buttons?: ButtonBuilder[];
};

export type CommandModuleType =
  | 'Shop'
  | 'Games'
  | 'Economy'
  | 'Utility'
  | 'Moderation';

export type config_type = {
  modules: {
    message_context: boolean;
    slash: boolean;
    user_context: boolean;
  };

  logger: boolean;
  errors_channel: string;
  owner: string;
  guild_id: string;
  allowed_modules: CommandModuleType[];

  shop: {
    max_item_price: number;
    min_item_price: number;
    max_item_name_length: number;
    min_item_name_length: number;
    min_item_text_length: number;
    max_item_text_length: number;
  };
};

export type inventory_type = Array<{
  _id: ObjectId;
  amount: number;
}>;

export type warn_type = {
  reason: '';
  date: number;
  moderator: string;
};

export type mute_type = {
  reason: string;
  date: number;
  moderator: string;
  roles: string[];
  expire: number;
  time: number;
};

export type ban_type = {
  reason: string;
  moderator: string;
  date: number;
  expire: number;
};

export type moderation_mute_type = {
  id: string;
  reason: string;
  date: number;
  moderator: string;
  roles: string[];
  expire: number;
  actieve: boolean;
  guild: string;
};

export type moderation_ban_type = {
  id: string;
  reason: string;
  date: number;
  expire: number;
  moderator: string;
  guild: string;
  actieve: boolean;
};

export type user_type = Partial<{
  id: string;
  balance: number;
  inventory: inventory_type;
  role: '';
  cooldowns: {};
}>;

export type rulesLogType = {
  title: string;
  author: GuildMember;
  content: string;
  logId?: string;
};

export type giveawayLogType = {
  creator: GuildMember;
  sponsor: GuildMember;
  card: string;
  timer: number;
  description: string;
  logId?: string;
};

export type bountyLogType = {
  author: GuildMember;
  card: string;
  bounty: number;
  description: string;
  logId?: string;
};
