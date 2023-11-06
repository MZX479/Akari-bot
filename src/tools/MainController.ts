import { DbNote } from '#types';
import { InteractionTemplate } from '@/config/templates';
import { HandleErrorSecondary, HandleErrorSecondaryAsync } from '@/decorators';
import {
  Guild,
  EmbedBuilder,
  TextChannel,
  CommandInteraction,
  TextInputBuilder,
  ModalBuilder,
  ActionRowBuilder,
} from 'discord.js';
import { MongoClient } from '@/Main';
import { Collection, Db } from 'mongodb';

export class MainController extends InteractionTemplate {
  private _db: Db;
  private _collection: Collection;
  private _guild: Guild;
  interaction: CommandInteraction;
  constructor(
    interaction: CommandInteraction,
    guild: Guild,
    collectionName: string
  ) {
    super(interaction);
    this._guild = guild;
    this._db = MongoClient.db(guild.id);
    this._collection = this._db.collection(collectionName);
    this.interaction = interaction;
  }

  @HandleErrorSecondaryAsync()
  async createDbNote(data: DbNote) {
    if (!data) throw new Error('Db data was not provided, [createDbNote]');

    const { author, content } = data;

    return await this._collection.insertOne({
      author,
      content,
    });
  }

  @HandleErrorSecondaryAsync()
  async updateDbNote(data: DbNote) {
    if (!data) throw new Error('Db data was not provided, [updateDbNote]');

    const { author, content } = data;

    return await this._collection.updateOne(
      {
        author,
      },
      {
        $set: {
          content,
        },
      }
    );
  }

  @HandleErrorSecondaryAsync()
  async embedSender(content: EmbedBuilder, channel: TextChannel) {
    if (!content || !channel)
      throw new Error('Content or channel were not provided, [embedSender]');

    return await channel.send({ embeds: [content] });
  }

  @HandleErrorSecondaryAsync()
  async embedUpdate(
    content: EmbedBuilder,
    channel: TextChannel,
    messageId: string
  ) {
    if (!content || !channel)
      throw new Error('Content or channel were not provided, [embedEditor]');

    const currentMessage = await channel.messages.fetch(messageId);
    if (!currentMessage) throw new Error('Message does not exist!');

    return await currentMessage.edit({ embeds: [content] });
  }

  @HandleErrorSecondaryAsync()
  async embedRemover(
    content: EmbedBuilder,
    channel: TextChannel,
    messageId: string
  ) {
    if (!content || !channel)
      throw new Error('Content or channelId were not provided, [embedRemover]');

    const currentMessage = await channel.messages.fetch(messageId);
    if (!currentMessage) throw new Error('Message does not exist!');

    return await currentMessage.delete();
  }

  @HandleErrorSecondaryAsync()
  async modalCreate(data: TextInputBuilder): Promise<ModalBuilder> {
    if (!data) throw new Error('Data was not provided!');

    const modal = new ModalBuilder()
      .setCustomId('descriptionsModal')
      .setTitle('Describe if it needs to.');

    const inputField = data;

    const row = new ActionRowBuilder<TextInputBuilder>().addComponents(
      inputField
    );

    modal.addComponents(row);

    return modal;
  }
}
