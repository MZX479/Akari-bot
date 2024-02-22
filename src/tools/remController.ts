import {
  ActionRowBuilder,
  EmbedBuilder,
  Guild,
  ModalBuilder,
  TextChannel,
  TextInputBuilder,
} from 'discord.js';
import { remindDbType } from '#types';
import { Db, Collection } from 'mongodb';
import { MongoClient } from '@/Main';
import { HandleErrorSecondary, HandleErrorSecondaryAsync } from '@/decorators';

export class remindersController {
  private _db: Db;
  private _collection: Collection;
  private guild: Guild;
  constructor(guild: Guild) {
    this.guild = guild;
    this._db = MongoClient.db(guild.id);
    this._collection = this._db.collection(
      process.env.REMINDERS_COLLECTION_NAME
    );
  }

  @HandleErrorSecondary()
  getEmbed(): EmbedBuilder {
    return new EmbedBuilder();
  }

  @HandleErrorSecondary()
  getChannelId(): string {
    const channelId = process.env.MAIN_CHANNEL_ID;
    if (!channelId) throw new Error('Channel id does not exist!');

    return channelId;
  }

  @HandleErrorSecondary()
  getChannel(): TextChannel {
    const channelId = this.getChannelId();
    if (!channelId) throw new Error('Channel id does not exist!');

    const channel = this.guild!.channels.cache.get(channelId) as TextChannel;
    if (!channel) throw new Error('Channel does not exist!');

    return channel;
  }

  @HandleErrorSecondaryAsync()
  async sendReminder(authorId: string, embed: EmbedBuilder) {
    if (!authorId || !embed)
      throw new Error('Embed or author id were not provided!!');

    const channel = this.getChannel();
    if (!channel) throw new Error('Channel does not exist!');

    return await channel.send({ content: `<@${authorId}>`, embeds: [embed] });
  }

  @HandleErrorSecondaryAsync()
  async createReminderDbNote(note: remindDbType) {
    if (!note) throw new Error('Note was not provided!');

    const { authorId, timer, id, status, content } = note;

    return await this._collection.insertOne({
      authorId,
      timer,
      id,
      status,
      content,
    });
  }

  async updateReminderDbNote(id: string, status: remindDbType['status']) {
    if (!id || !status) throw new Error('Note was not provided!');

    return await this._collection.updateOne(
      {
        id,
      },
      {
        $set: {
          status,
        },
      }
    );
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
