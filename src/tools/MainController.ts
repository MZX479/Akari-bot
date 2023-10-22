import { DbNote, bountyLogType, giveawayLogType, rulesLogType } from '#types';
import { MessageTemplate } from '@/config/templates';
import { HandleErrorSecondaryAsync } from '@/decorators';
import {
  Colors,
  Guild,
  Message,
  EmbedBuilder,
  TextChannel,
  time,
} from 'discord.js';
import { discharge } from '@/tools';
import { MongoClient } from '@/Main';
import { Collection, Db } from 'mongodb';

export class MainController extends MessageTemplate {
  private _db: Db;
  private _collection: Collection;
  private _collection_name: string | null = null;
  private _guild: Guild;
  constructor(message: Message, guild: Guild) {
    super(message);
    this._guild = guild;
    this._collection_name;
    this._db = MongoClient.db(guild.id);
    this._collection = this._db.collection(this._collection_name as string);
    this.message = message;
  }

  @HandleErrorSecondaryAsync()
  async logSender(content: EmbedBuilder, channelId: string) {
    if (!content || !channelId)
      throw new Error('Content or channelId were not provided, [logSender]');

    const channel = this.message.guild!.channels.cache.get(channelId);
    if (!channel) throw new Error('Channel does not exist!');

    return await (channel as TextChannel).send({ embeds: [content] });
  }

  @HandleErrorSecondaryAsync()
  async createDbNote(data: DbNote, collection: string) {
    if (!data) throw new Error('Db data was not provided, [createDbNote]');

    this._collection_name = collection;

    const { author, msgId, content } = data;

    return await this._collection.insertOne({
      author,
      msgId,
      content,
    });
  }

  @HandleErrorSecondaryAsync()
  async updateDbNote(data: DbNote, collection: string) {
    if (!data) throw new Error('Db data was not provided, [updateDbNote]');

    this._collection_name = collection;

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
  async deleteDbNote(data: DbNote, collection: string) {
    if (!data) throw new Error('Db data was not provided, [deleteDbNote]');

    this._collection_name = collection;

    const { msgId } = data;
    if (!msgId) throw new Error('msgId was not provided!');

    return await this._collection.deleteOne({ msgId });
  }

  @HandleErrorSecondaryAsync()
  async embedSender(content: EmbedBuilder, channelId: string) {
    if (!content || !channelId)
      throw new Error('Content or channelId were not provided, [embedSender]');

    const channel = this.message.guild!.channels.cache.get(channelId);
    if (!channel) throw new Error('Channel does not exist!');

    return await (channel as TextChannel).send({ embeds: [content] });
  }

  @HandleErrorSecondaryAsync()
  async embedEditor(
    content: EmbedBuilder,
    channelId: string,
    messageId: string
  ) {
    if (!content || !channelId)
      throw new Error('Content or channel were not provided, [embedEditor]');

    const channel = this.message.guild!.channels.cache.get(channelId);
    if (!channel) throw new Error('Channel does not exist!');

    const currentMessage = await (channel as TextChannel).messages.fetch(
      messageId
    );
    if (!currentMessage) throw new Error('Message does not exist!');

    return await currentMessage.edit({ embeds: [content] });
  }

  @HandleErrorSecondaryAsync()
  async embedRemover(
    content: EmbedBuilder,
    channelId: string,
    messageId: string
  ) {
    if (!content || !channelId)
      throw new Error('Content or channelId were not provided, [embedRemover]');

    const channel = this.message.guild!.channels.cache.get(channelId);
    if (!channel) throw new Error('Channel does not exist!');

    const currentMessage = await (channel as TextChannel).messages.fetch(
      messageId
    );
    if (!currentMessage) throw new Error('Message does not exist!');

    return await currentMessage.delete();
  }
}
