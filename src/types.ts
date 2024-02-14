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
  muteRole: string;
  allowed_modules: CommandModuleType[];
};

export type user_type = Partial<{
  id: string;
  cooldowns: {
    bounty: number;
  };
}>;

export type violationsType = {
  type: 'warn' | 'kick' | 'ban' | 'mute' | 'unmute' | 'unban';
  moderator: string;
  time: Date;
  reason: string;
  timeOfPunishment?: number | string;
};

export type rulesType = {
  title: string;
  content: string;
};

export type giveawayType = {
  sponsor: GuildMember;
  prize: string;
  timer: number;
  description: string;
};

export type bountyType = {
  target: string;
  reward: string;
  description: string;
};

export type moderationType = {
  title: string;
  moderator: string;
  member: string;
  time: Date;
  description: string;
};

export type PollsChoices = {
  choiceName: string;
};

export type DbNote = {
  _id?: ObjectId;
  author?: string;
  target?: string;
  giveawayTime?: number;
  msgId?: string;
  content: {
    sponsor?: string;
    winner?: string;
    prize?: string;
    bounty?: string;
    bountyReward?: string;
    bountyStatus?: 'active' | 'done' | 'canceled' | 'deleted';
    giveawayStatus?: 'active' | 'done';
    giveawayParticipants?: Array<string>;
    violations?: Array<violationsType>;
    description?: string;
  };
};

export type bountyLogType = {
  target: string;
  reward: string;
  description: string;
  status: 'active' | 'done' | 'canceled' | 'deleted';
  msgId: string;
};

export type giveawayLogType = {
  sponsor: GuildMember;
  timer: number;
  prize: string;
  description: string;
  msgId: string;
};

export type rulesLogType = {
  title: string;
  description: string;
  msgId: string;
};

export type moderationLogType = {
  title: string;
  moderator: GuildMember;
  member: GuildMember;
  time: Date;
  description: string;
  timeOfPunishment?: number;
  timeOfPunishmentNoParse?: string;
};
