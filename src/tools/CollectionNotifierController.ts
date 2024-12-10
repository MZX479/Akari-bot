import { collectionsNotifierType, seriesType } from '#types';
import { HandleErrorSecondary, HandleErrorSecondaryAsync } from '@/decorators';
import { MongoClient } from '@/Main';
import { ActionRowBuilder, EmbedBuilder, Guild } from 'discord.js';
import { Collection, Db } from 'mongodb';

export class CollectionsNotifier {
  private _db: Db;
  private _collection: Collection;
  constructor(guild: Guild) {
    this._db = MongoClient.db(guild.id);
    this._collection = this._db.collection(
      process.env.NOTIFIERCOLLECTIONS_COLLECTION_NAME
    );
  }

  @HandleErrorSecondary()
  getEmbed(): EmbedBuilder {
    return new EmbedBuilder();
  }

  @HandleErrorSecondaryAsync()
  async getDbNote(authorId: string) {
    if (!authorId) throw new Error('Author id was not provided!');

    return await this._collection.findOne<collectionsNotifierType>({
      author: authorId,
    });
  }

  @HandleErrorSecondaryAsync()
  async getSeriesNote(authorId: string, seriesId: string): Promise<seriesType> {
    if (!authorId || !seriesId)
      throw new Error('Author id or series id was not provided!');

    const noteSeries = await this.getDbNote(authorId);
    if (!noteSeries) throw new Error('Db note does not exist');

    const seriesProfile = noteSeries.series.filter(
      (searchId) => searchId.id === seriesId
    )[0];

    return seriesProfile;
  }

  async updateDbNote(note: collectionsNotifierType) {
    if (!note) throw new Error('Note was not provided!');

    const { author, mainNotify, series } = note;

    return await this._collection.updateOne(
      { author },
      { $set: { mainNotify, series } }
    );
  }

  async updateMainNotifier(
    authorId: string,
    notifyStatus: collectionsNotifierType['mainNotify']
  ) {
    if (!authorId || !notifyStatus)
      throw new Error('Author id or status was not provided!');

    return await this._collection.updateOne(
      { author: authorId },
      { $set: { mainNotify: notifyStatus } }
    );
  }

  async addNewSeries(authorId: string, seriesName: string) {
    if (!authorId || !seriesName)
      throw new Error('Author id or series were not provided!');

    const note = await this.getDbNote(authorId);

    const newId = this.createId();

    const addSeries: seriesType = { name: seriesName, notify: true, id: newId };

    if (!note) {
      const newSeries = [] as seriesType[];
      newSeries.push(addSeries);

      return await this._collection.insertOne({
        author: authorId,
        mainNotify: true,
        series: newSeries,
      });
    } else {
      const series = note.series;
      series.push(addSeries);

      return await this.updateDbNote({
        author: authorId,
        mainNotify: true,
        series,
      });
    }
  }

  async deleteSeriesProfile(authorId: string, seriesId: string) {
    if (!authorId || !seriesId)
      throw new Error('Author id or series id were not provided!');
  }

  async clearSeries(authorId: string) {
    if (!authorId) throw new Error('Author id was not provided!');

    return await this.updateDbNote({ author: authorId, series: [] });
  }

  createId(): string {
    let newId = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = characters.length;
    let counter = 0;
    while (counter < length && counter <= 17) {
      newId += characters.charAt(Math.floor(Math.random() * length));
      counter += 1;
    }

    return newId;
  }
}
