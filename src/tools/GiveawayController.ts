import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Guild,
  ModalBuilder,
  TextChannel,
  TextInputBuilder,
} from 'discord.js';
import { DbNote } from '#types';
import { Db, Collection } from 'mongodb';
import { MongoClient } from '@/Main';
import { HandleErrorSecondary, HandleErrorSecondaryAsync } from '@/decorators';

export class GiveawayController {
  private _db: Db;
  private _collection: Collection;
  private guild: Guild;
  constructor(guild: Guild) {
    this.guild = guild;
    this._db = MongoClient.db(guild.id);
    this._collection = this._db.collection(
      process.env.GIVEAWAY_COLLECTION_NAME
    );
  }

  @HandleErrorSecondary()
  getGiveawayEmbed(): EmbedBuilder {
    return new EmbedBuilder();
  }

  @HandleErrorSecondary()
  getButton(): ButtonBuilder {
    return new ButtonBuilder()
      .setLabel('Participate')
      .setStyle(ButtonStyle.Success)
      .setCustomId('participate');
  }

  @HandleErrorSecondary()
  getGiveawayChannel(): TextChannel {
    const channelId = process.env.GIVEAWAY_CHANNEL_ID;
    if (!channelId) throw new Error('Giveaway channel id does not exist!');

    const channel = this.guild!.channels.cache.get(channelId) as TextChannel;
    if (!channel) throw new Error('Giveaway channel does not exist!');

    return channel;
  }

  @HandleErrorSecondary()
  getGiveawayLogChannel(): TextChannel {
    const channelId = process.env.LOGS_CHANNEL_ID;
    if (!channelId) throw new Error('Log channel id does not exist!');

    const channel = this.guild!.channels.cache.get(channelId) as TextChannel;
    if (!channel) throw new Error('Log channel does not exist!');

    return channel;
  }

  @HandleErrorSecondary()
  getGiveawayRoleId(): string {
    const id = process.env.GIVEAWAY_ROLE_ID;
    if (!id) throw new Error('GIVEAWAY_ROLE_ID does not exist!');

    return id;
  }

  @HandleErrorSecondaryAsync()
  async giveawayEditEmbed(msgId: string, embed: EmbedBuilder, components?: []) {
    if (!msgId || !embed) throw new Error('MsgId or embed were not provided!');

    const channel = this.getGiveawayChannel();
    if (!channel)
      throw new Error('Something went wrong. Giveaway Channel does not exist!');

    const message = await channel.messages.fetch(msgId);
    if (!message)
      throw new Error('Something went wrong. Message does not exist!');

    return await message.edit({ embeds: [embed], components });
  }

  @HandleErrorSecondaryAsync()
  async giveawayCreate(embed: EmbedBuilder, button: ButtonBuilder) {
    if (!embed || !button)
      throw new Error('Embed or button were not provided!');

    const roleId = this.getGiveawayRoleId();
    if (!roleId)
      throw new Error('Something went wrong. Giveaway role id does not exist!');

    const channel = this.getGiveawayChannel();
    if (!channel)
      throw new Error('Something went wrong. Giveaway channel does not exist!');

    return await channel.send({
      content: `<@&${roleId}>`,
      embeds: [embed],
      components: [new ActionRowBuilder().addComponents(button) as any],
    });
  }

  @HandleErrorSecondaryAsync()
  async giveawayRemover(messageId: string) {
    if (!messageId) throw new Error('Message id was not provided!');

    const channel = this.getGiveawayChannel();
    if (!channel)
      throw new Error('Something went wrong. Giveaway channel does not exist!');

    const message = await channel.messages.fetch(messageId);
    if (!message) throw new Error('Message does not exist!');

    return await message.delete();
  }

  @HandleErrorSecondaryAsync()
  async getGiveawayDbNote(msgId: string) {
    if (!msgId)
      throw new Error('msgId was not provided! [getGiveawayDbNote (Giveaway)]');

    return await this._collection.findOne<DbNote>({ msgId });
  }

  @HandleErrorSecondaryAsync()
  async createGiveawayDbNote(data: DbNote) {
    if (!data)
      throw new Error(
        'Data was not provided, [createGiveawayDbNotel (Giveaway)]'
      );

    return await this._collection.insertOne(data);
  }

  @HandleErrorSecondaryAsync()
  async updateGiveawayDbNote(data: DbNote) {
    if (!data)
      throw new Error(
        'Data was not provided, [updateGiveawayDbNotel (Giveaway)]'
      );

    const { msgId, content } = data;

    return await this._collection.updateOne(
      {
        msgId,
      },
      {
        $set: {
          content,
        },
      }
    );
  }

  @HandleErrorSecondaryAsync()
  async embedUpdater(embed: EmbedBuilder, channel: TextChannel, msgId: string) {
    if (!embed || !channel || !msgId)
      throw new Error('One of arguments were not provided!');

    const message = await channel.messages.fetch(msgId);
    if (!message) throw new Error('Message does not exist!');

    return await message.edit({ embeds: [embed] });
  }

  @HandleErrorSecondaryAsync()
  async embedSender(embed: EmbedBuilder, channel: TextChannel) {
    if (!embed || !channel)
      throw new Error('Embed or channel was not provided!');

    return await channel.send({ embeds: [embed] });
  }

  @HandleErrorSecondaryAsync()
  async giveawayLogCreate(embed: EmbedBuilder) {
    if (!embed) throw new Error('Embed was not provided! [giveawayLogCreate]');

    const channel = this.getGiveawayLogChannel();
    if (!channel)
      throw new Error(
        'Something went wrong. Giveaway log channel does not exist!'
      );

    return await this.embedSender(embed, channel);
  }

  @HandleErrorSecondaryAsync()
  async giveawayLogUpdate(embed: EmbedBuilder, logId: string) {
    if (!embed || !logId)
      throw new Error('Embed or logId were not provided! [giveawayLogUpdate]');

    const channel = this.getGiveawayLogChannel();
    if (!channel)
      throw new Error(
        'Something went wrong. Giveaway log channel does not exist!'
      );

    return await this.embedUpdater(embed, channel, logId);
  }

  @HandleErrorSecondary()
  modalCreate(data: TextInputBuilder): ModalBuilder {
    if (!data) throw new Error('Data was not provided!');

    const modal = new ModalBuilder()
      .setCustomId('description-modal')
      .setTitle('Describe if it needs to.');

    const inputField = data;

    const row = new ActionRowBuilder<TextInputBuilder>().addComponents(
      inputField
    );

    modal.addComponents(row);

    return modal;
  }
}
