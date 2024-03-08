import {
  ActionRowBuilder,
  EmbedBuilder,
  Guild,
  GuildMember,
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

  async getMember(memberId: string): Promise<GuildMember> {
    const member = await this.guild.members.fetch(memberId);
    if (!member) throw new Error('Member does not exist!');

    return member;
  }

  @HandleErrorSecondaryAsync()
  async getDm(member: GuildMember) {
    return await member.user.createDM();
  }

  @HandleErrorSecondaryAsync()
  async sendReminder(member: GuildMember, embed: EmbedBuilder) {
    if (!member || !embed)
      throw new Error('Embed or member were not provided!!');

    const dm = await this.getDm(member);
    if (!dm) throw new Error('Dm does not exist!');

    return await dm.send({ embeds: [embed] });
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
