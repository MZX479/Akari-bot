import config from '#config';
import { CustomError } from '#types';
import {
  format_error,
  handle_error,
  InteractionGuildsSettingsManager,
  Profile,
} from '@/tools';
import { InteractionDbManager } from '@/tools/InteractionDbManager';
import {
  CommandInteraction,
  InteractionReplyOptions,
  Message,
  EmbedBuilder,
  EmbedData,
  Colors,
  GuildMember,
  Interaction,
} from 'discord.js';

/** @description Template for interaction commands */
export class InteractionTemplate {
  private _interaction: CommandInteraction;
  private _embed_sample: EmbedData;

  guild_settings: InteractionGuildsSettingsManager;
  profile: Profile;
  db: InteractionDbManager;

  constructor(_interaction: CommandInteraction) {
    try {
      this._interaction = _interaction;

      this.guild_settings = new InteractionGuildsSettingsManager(
        this._interaction.guildId!
      );
      this.profile = new Profile(_interaction.guild!);
      this.db = new InteractionDbManager(_interaction.guild?.id!);
      this._embed_sample = {
        footer: {
          text: this._interaction.user.tag,
          iconURL: this._interaction.user.displayAvatarURL(),
        },
      };
    } catch (e) {
      format_error(e as CustomError, '[template InteractionTemplate]');
      throw e;
    }
  }

  /** @description Get command argument by his name */
  get_argument(argument_name: string) {
    return this._interaction.options.data.filter(
      (arg) => arg.name === argument_name
    )[0];
  }

  /** @description Get member from arguments */
  async get_member(): Promise<GuildMember | undefined> {
    try {
      const mention = this.get_argument('mention')?.member as
        | GuildMember
        | undefined;
      const id = this.get_argument('id')?.value as string | undefined;

      if (mention) return mention;

      if (id) {
        const id_regex = /^\d{18}$/gm;

        if (!id_regex.test(id)) return undefined;

        return await this._interaction.guild?.members
          .fetch(id)
          .catch(() => undefined);
      }

      return undefined;
    } catch (e) {
      format_error(
        e as CustomError,
        '[template InteractionTemplate] get_member'
      );

      throw e;
    }
  }

  /** @description Send success embed visible for everyone */
  async replyTrue(
    content: string,
    options?: InteractionReplyOptions
  ): Promise<Message<boolean>> {
    try {
      const embed_true = this.get_true(content);
      if (!embed_true)
        throw new Error('Something went wrong while creating Embed');
      return (await this.send({
        embeds: [embed_true],
        ...options,
      })) as Message<boolean>;
    } catch (err) {
      format_error(
        err as CustomError,
        '[template InteractionTemplate] replyTrue'
      );

      throw err;
    }
  }

  /** @description Send error embed visible only for member invoked current command */
  async replyFalseH(
    content: string,
    options: InteractionReplyOptions = {}
  ): Promise<Message> {
    try {
      options.ephemeral = true;

      return await this.replyFalse(content, options);
    } catch (e) {
      format_error(
        e as CustomError,
        '[template InteractionTemplate] replyFalseH'
      );

      throw e;
    }
  }

  /** @description Send success embed visible only for member invoked current command */
  async replyTrueH(
    content: string,
    options: InteractionReplyOptions = {}
  ): Promise<Message> {
    try {
      options.ephemeral = true;

      return await this.replyTrue(content, options);
    } catch (e) {
      format_error(
        e as CustomError,
        '[template InteractionTemplate] replyTrueH'
      );

      throw e;
    }
  }

  /** @description Send error embed visible for everyone */
  async replyFalse(
    content: string,
    options?: InteractionReplyOptions
  ): Promise<Message<boolean>> {
    try {
      const embed_false = this.get_false(content);
      if (!embed_false)
        throw new Error('Something went wrong while creating embed');

      const result = (await this.send({
        embeds: [embed_false],
        ...options,
      })) as Message<boolean>;

      return result;
    } catch (err) {
      format_error(
        err as CustomError,
        '[template InteractionTemplate] replyFalse'
      );

      throw err;
    }
  }

  async reply(
    content: string,
    options?: InteractionReplyOptions
  ): Promise<Message<boolean>> {
    try {
      const embed_neutral = this.get_neutral(content);
      if (!embed_neutral)
        throw new Error('Something went wrong while creating embed');

      return (await this.send({
        embeds: [embed_neutral],
        ...options,
      })) as Message<boolean>;
    } catch (err) {
      format_error(err as CustomError, '[template InteractionTemplate] reply');

      throw err;
    }
  }

  async replyH(
    content: string,
    options: InteractionReplyOptions = {}
  ): Promise<Message<boolean>> {
    try {
      options.ephemeral = true;
      return await this.reply(content, options);
    } catch (err) {
      format_error(err as CustomError, '[template InteractionTemplate] replyH');

      throw err;
    }
  }

  get_neutral(content: string) {
    try {
      const false_embed = this._generate_embed({
        description: `>>> ${content}`,
        ...this._embed_sample,
        color: Colors.Yellow,
      });

      return false_embed;
    } catch (err) {
      format_error(
        err as CustomError,
        '[template InteractionTemplate] get_neutral'
      );

      throw err;
    }
  }

  get_false(content: string) {
    try {
      const false_embed = this._generate_embed({
        description: `>>> ${content}`,
        color: Colors.Red,
        ...this._embed_sample,
      });

      return false_embed;
    } catch (err) {
      format_error(
        err as CustomError,
        '[template InteractionTemplate] get_false'
      );

      throw err;
    }
  }
  get_true(content: string) {
    try {
      const true_embed = this._generate_embed({
        description: `>>> ${content}`,
        color: Colors.Green,
        ...this._embed_sample,
      });

      return true_embed;
    } catch (err) {
      format_error(
        err as CustomError,
        '[template InteractionTemplate] get_true'
      );

      throw err;
    }
  }

  private _generate_embed(options: EmbedData) {
    try {
      return new EmbedBuilder(options);
    } catch (err) {
      format_error(
        err as CustomError,
        '[template InteractionTemplate] _generate_embed'
      );

      throw err;
    }
  }

  async send(options: InteractionReplyOptions): Promise<Message> {
    try {
      options.fetchReply = true;
      if (this._interaction.replied || this._interaction.deferred) {
        if (options?.ephemeral) {
          if (this._interaction.ephemeral)
            return await this._interaction.editReply(options).catch((e) => {
              throw e;
            });
          else
            return await this._interaction.followUp(options).catch((e) => {
              throw e;
            });
        } else
          return await this._interaction.editReply(options).catch((e) => {
            throw e;
          });
      } else {
        return (await this._interaction.reply(
          options
        )) as unknown as Message<boolean>;
      }
    } catch (err) {
      format_error(err as CustomError, '[template InteractionTemplate] send');

      throw err;
    }
  }

  async unexpected_error() {
    try {
      await this.replyFalseH(
        `An unexpected error occured.\nContact the <@${config.owner}>`
      );
    } catch (err) {
      handle_error(
        err as CustomError,
        '[template InteractionTemplate] unexpected_error'
      );
    }
  }
}
