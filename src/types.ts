import { ObjectId } from 'mongodb';
import {
  ActionRowBuilder,
  ButtonBuilder,
  CommandInteraction,
  EmbedBuilder,
  GuildMember,
  Message,
  PermissionResolvable,
  SlashCommandBuilder,
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

export type MessageDecoratorDataType = {
  name: string;
};

export type MessageDecoratorArgsType = {
  data: MessageDecoratorDataType;
  permissions?: SlashDecoratorPermissionsType;
  dev_permissions?: SlashDecoratorPermissionsType;
  type: CommandModuleType;
  disabled?: boolean;
  dev_disabled?: boolean;
};

export type MessageDecoratorPlate = {
  data?: MessageDecoratorDataType;
  dev_permissions?: SlashDecoratorPermissionsType | undefined;
  permissions?: SlashDecoratorPermissionsType | undefined;

  new (interaction: Message): {};
};

export type MessageLoaderCommandType = {
  command: MessageDecoratorPlate;
  payload: MessageDecoratorArgsType;
};

export type CommandModuleType =
  | 'Shop'
  | 'Games'
  | 'Economy'
  | 'Utility'
  | 'Moderation';

export type config_type = {
  modules: {
    message: boolean;
    slash: boolean;
    user_context: boolean;
  };

  logger: boolean;
  errors_channel: string;
  owner: string;
  guild_id: string;
  allowed_modules: CommandModuleType[];
};

export type user_type = Partial<{
  id: string;
  cooldowns: {
    bounty: number;
  };
}>;

export type rulesType = {
  title: string;
  author: GuildMember;
  content: string;
  logId?: string;
};

export type giveawayType = {
  creator: GuildMember;
  sponsor: GuildMember;
  card: string;
  timer: number;
  description: string;
  logId?: string;
};

export type bountyType = {
  author: string;
  target: string;
  reward: string;
  description: string;
  logId?: string;
};

export type DbNote = {
  _id?: ObjectId;
  author: string;
  content: {
    sponsor?: string;
    card?: string;
    bounty?: string;
    bountyStatus?: 'active' | 'done' | 'canceled';
    giveawayStatus?: 'active' | 'done';
    description: string;
  };
};

export type bountyLogType = {
  author: string;
  target: string;
  reward: string;
  description: string;
  msgId: string;
};

export type giveawayLogType = {
  creator: string;
  sponsor: string;
  time: number;
  card: string;
  description: string;
};

export type ruleLogType = {
  author: string;
  description: string;
};
