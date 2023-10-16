import { user_type } from '#types';
import { MongoClient } from '@/Main';
import { HandleErrorSecondaryAsync } from '@/decorators';
import { Guild } from 'discord.js';
import { Collection, Db, FindOptions, UpdateFilter } from 'mongodb';

export class Profile {
  private _db: Db;
  private _collection: Collection;
  private _guild: Guild;

  constructor(guild: Guild) {
    this._guild = guild;
    this._db = MongoClient.db(guild.id);
    this._collection = this._db.collection('Users');
  }

  /** @description Get user data by his id */
  @HandleErrorSecondaryAsync()
  async get_data<InputType extends user_type = user_type>(
    id: string,
    options?: FindOptions
  ) {
    return this._collection.findOne<InputType>({ id }, options);
  }

  @HandleErrorSecondaryAsync()
  async update_data(id: string, data: UpdateFilter<user_type>) {
    const exist_user = await this.get_data<Pick<user_type, 'id'>>(id, {
      projection: { id: 1 },
    });

    if (exist_user && exist_user.id) {
      return await this._collection.updateOne(
        {
          id,
        },
        { $set: data }
      );
    } else {
      return await this._collection.insertOne({
        id,
        ...data,
      });
    }
  }
}
