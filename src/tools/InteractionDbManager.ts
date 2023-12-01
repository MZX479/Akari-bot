import { MongoClient } from '@/Main';
import { HandleErrorSecondary } from '@/decorators';
import { Db } from 'mongodb';

export class InteractionDbManager {
  db: Db;
  constructor(guild_id: string) {
    this.db = MongoClient.db(guild_id);
  }

  @HandleErrorSecondary()
  collection(collection_name: string) {
    return this.db.collection(collection_name);
  }
}
