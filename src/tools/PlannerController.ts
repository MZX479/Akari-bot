import { plannerType, taskType } from '#types';
import { HandleErrorSecondary, HandleErrorSecondaryAsync } from '@/decorators';
import { MongoClient } from '@/Main';
import {
  ActionRowBuilder,
  EmbedBuilder,
  Guild,
  ModalBuilder,
  TextInputBuilder,
} from 'discord.js';
import { Collection, Db } from 'mongodb';

export class Planner {
  private _db: Db;
  private _collection: Collection;
  constructor(guild: Guild) {
    this._db = MongoClient.db(guild.id);
    this._collection = this._db.collection(process.env.PLANNER_COLLECTION_NAME);
  }

  @HandleErrorSecondary()
  getEmbed(): EmbedBuilder {
    return new EmbedBuilder();
  }

  @HandleErrorSecondaryAsync()
  async getDbNote(author: string): Promise<plannerType> {
    if (!author)
      throw new Error('Author was not provided! [getDbNote (Planner)]');

    const note = await this._collection.findOne<plannerType>({ author });
    if (!note) throw new Error('DbNote was not found [getDbNote (Planner)]');

    return note;
  }

  @HandleErrorSecondaryAsync()
  async createDbNote(data: plannerType) {
    if (!data) throw new Error('Data does not exist! [createDbNote (Planner)]');

    return await this._collection.insertOne(data);
  }

  @HandleErrorSecondary()
  async updateDbNote(data: plannerType) {
    if (!data) throw new Error('Data does not exist! [updateDbNote (Planner)]');

    const { author, tasks } = data;

    return await this._collection.updateOne(
      {
        author,
      },
      {
        $set: {
          tasks,
        },
      }
    );
  }

  @HandleErrorSecondaryAsync()
  async addTask(authorId: string, task: taskType) {
    if (!authorId || !task)
      throw new Error(
        'Author id or task were not provided! [addTask (Planner)]'
      );

    const note = await this._collection.findOne<plannerType>({
      author: authorId,
    });
    if (!note) {
      const newTasks = [];
      newTasks.push(task);

      return await this._collection.insertOne({
        author: authorId,
        tasks: newTasks,
      });
    } else {
      return note.tasks.push(task);
    }
  }

  @HandleErrorSecondaryAsync()
  async editTask(authorId: string, taskId: string, description: string) {
    if (!authorId || !taskId)
      throw new Error(
        'One or more argumnets were not provided! [editTask] (Planner)'
      );

    const note = await this.getDbNote(authorId);

    const filterTask = note.tasks.filter((task) => task.taskId === taskId)[0];

    return (filterTask.description = description);
  }

  @HandleErrorSecondaryAsync()
  async deleteTask(authorId: string, taskId: string) {
    if (!authorId || !taskId)
      throw new Error(
        'One of arguments does not exist! [deleteTask (Planner)]'
      );

    const note = await this.getDbNote(authorId);
    if (!note)
      throw new Error('Db note does not exist! [deleteTask (Planner)]');

    const updatedTasks = note.tasks.filter((task) => taskId != task.taskId);

    return await this.updateDbNote({ author: authorId, tasks: updatedTasks });
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
