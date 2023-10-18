import config from '@/config/config';
import { CustomError } from '@/types';
import { GuildSettingsManager, format_error, handle_error } from '@/tools';
import {
  Message,
  EmbedBuilder,
  EmbedData,
  Colors,
  MessageReplyOptions,
  MessageFlags,
} from 'discord.js';

import { HandleErrorSecondary, HandleErrorSecondaryAsync } from '@/decorators';

/** @description Template for message commands */
export class MessageTemplate {
  private _embed_sample: EmbedData;

  constructor(public message: Message) {
    this._embed_sample = {
      footer: {
        text: this.message.author.tag,
        iconURL: this.message.author.displayAvatarURL(),
      },
    };
  }

  /** @description Send success embed visible for everyone */
  @HandleErrorSecondaryAsync()
  async replyTrue(
    content: string,
    options?: MessageReplyOptions
  ): Promise<Message<boolean>> {
    const embed_true = this.get_true(content);
    if (!embed_true)
      throw new Error('Something went wrong while creating Embed');
    return (await this.send({
      embeds: [embed_true],
      ...options,
    })) as Message<boolean>;
  }

  /** @description Send error embed visible for everyone */
  @HandleErrorSecondaryAsync()
  async replyFalse(
    content: string,
    options?: MessageReplyOptions
  ): Promise<Message<boolean>> {
    const embed_false = this.get_false(content);
    if (!embed_false)
      throw new Error('Something went wrong while creating embed');

    const result = (await this.send({
      embeds: [embed_false],
      ...options,
    })) as Message<boolean>;

    return result;
  }

  @HandleErrorSecondary()
  msgArgs() {
    const splittedContent = this.message.content.split(' ');
    splittedContent.splice(0, 1);
    return splittedContent;
  }

  @HandleErrorSecondaryAsync()
  async reply(
    content: string,
    options?: MessageReplyOptions
  ): Promise<Message<boolean>> {
    const embed_neutral = this.get_neutral(content);
    if (!embed_neutral)
      throw new Error('Something went wrong while creating embed');
    return (await this.send({
      embeds: [embed_neutral],
      ...options,
    })) as Message<boolean>;
  }

  /** @description Send success embed visible for everyone */
  @HandleErrorSecondaryAsync()
  async noReplyTrue(
    content: string,
    options?: MessageReplyOptions
  ): Promise<Message<boolean>> {
    const embed_true = this.get_true(content);
    if (!embed_true)
      throw new Error('Something went wrong while creating Embed');
    return (await this.sendNoReply({
      embeds: [embed_true],
      ...options,
    })) as Message<boolean>;
  }

  /** @description Send error embed visible for everyone */
  @HandleErrorSecondaryAsync()
  async noReplyFalse(
    content: string,
    options?: MessageReplyOptions
  ): Promise<Message<boolean>> {
    const embed_false = this.get_false(content);
    if (!embed_false)
      throw new Error('Something went wrong while creating embed');

    const result = (await this.sendNoReply({
      embeds: [embed_false],
      ...options,
    })) as Message<boolean>;

    return result;
  }

  @HandleErrorSecondaryAsync()
  async noReply(
    content: string,
    options?: MessageReplyOptions
  ): Promise<Message<boolean>> {
    const embed_neutral = this.get_neutral(content);
    if (!embed_neutral)
      throw new Error('Something went wrong while creating embed');
    return (await this.sendNoReply({
      embeds: [embed_neutral],
      ...options,
    })) as Message<boolean>;
  }

  @HandleErrorSecondary()
  get_neutral(content: string) {
    const false_embed = this._generate_embed({
      description: `>>> ${content}`,
      ...this._embed_sample,
      color: Colors.Yellow,
    });

    return false_embed;
  }
  @HandleErrorSecondary()
  get_false(content: string) {
    const false_embed = this._generate_embed({
      description: `>>> ${content}`,
      color: Colors.Red,
      ...this._embed_sample,
    });

    return false_embed;
  }
  @HandleErrorSecondary()
  get_true(content: string) {
    const true_embed = this._generate_embed({
      description: `>>> ${content}`,
      color: Colors.Green,
      ...this._embed_sample,
    });

    return true_embed;
  }

  @HandleErrorSecondary()
  private _generate_embed(options: EmbedData) {
    return new EmbedBuilder(options);
  }

  @HandleErrorSecondaryAsync()
  async send(options: MessageReplyOptions): Promise<Message> {
    return await this.message.reply(options);
  }

  async sendNoReply(options: MessageReplyOptions): Promise<Message> {
    return await this.message.channel.send(options).catch((e) => {
      throw e;
    });
  }

  async unexpected_error() {
    await this.message.reply({
      content: `При выполнении команды возникла непредвиненная ошибка.\nОбратитесь к <@${config.owner}>`,
    });
  }
}
