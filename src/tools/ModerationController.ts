import config from '#config';
import { DbNote } from '#types';
import { MongoClient, client } from '@/Main';
import { HandleErrorSecondary, HandleErrorSecondaryAsync } from '@/decorators';
import {
  ActionRowBuilder,
  EmbedBuilder,
  Guild,
  GuildMember,
  ModalBuilder,
  TextChannel,
  TextInputBuilder,
} from 'discord.js';
import { Collection, Db } from 'mongodb';

export class ModerationController {
  private _db: Db;
  _collection: Collection;
  private guild: Guild;
  constructor(guild: Guild) {
    this.guild = guild;
    this._db = MongoClient.db(guild.id);
    this._collection = this._db.collection(
      process.env.MODERATION_COLLECTION_NAME
    );
  }

  @HandleErrorSecondaryAsync()
  async getModerationLogsChannel() {
    const id = process.env.MODERATION_LOGS_CHANNEL_ID;
    if (!id) throw new Error('Channel id does not exist!');

    const channel = this.guild.channels.cache.get(id) as TextChannel;
    if (!channel) throw new Error('Channel does not exist!');

    return channel;
  }

  @HandleErrorSecondary()
  getEmbed(): EmbedBuilder {
    return new EmbedBuilder();
  }

  @HandleErrorSecondary()
  getMuteRoleId(): string {
    return config.muteRole;
  }

  @HandleErrorSecondaryAsync()
  async getDbNote(memberId: string) {
    if (!memberId) throw new Error('Member id was not provided!');

    const note = await this._collection.findOne<DbNote>({ author: memberId });

    return note;
  }

  @HandleErrorSecondaryAsync()
  async createDbNote(data: DbNote) {
    if (!data) throw new Error('Data was not provided');

    return await this._collection.insertOne(data);
  }

  @HandleErrorSecondaryAsync()
  async editDbNote(data: DbNote) {
    if (!data) throw new Error('Data was not provided!');

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
  async warn(member: GuildMember, embed: EmbedBuilder) {
    if (!member || !embed)
      throw new Error('Member or embed were not provided!');

    return await this.sendDmEmbed(member, embed);
  }

  @HandleErrorSecondaryAsync()
  async kick(member: GuildMember, reason: string, embed: EmbedBuilder) {
    if (!member || !reason || !embed)
      throw new Error('One of arguments was not provided!');

    await this.sendDmEmbed(member, embed);

    return await member.kick(reason);
  }

  @HandleErrorSecondaryAsync()
  async mute(member: GuildMember, embed: EmbedBuilder) {
    if (!member || !embed)
      throw new Error('One of arguments was not provided!');

    const role = this.getMuteRoleId();
    if (!role) throw new Error('Mute role id does not exist!');

    await this.sendDmEmbed(member, embed);

    return await member.roles.add(role);
  }

  @HandleErrorSecondaryAsync()
  async unmute(member: GuildMember, embed: EmbedBuilder) {
    if (!member || !embed)
      throw new Error('One of arguments was not provided!');

    const role = this.getMuteRoleId();
    if (!role) throw new Error('Mute role id does not exist!');

    await this.sendDmEmbed(member, embed);

    return await member.roles.remove(role);
  }

  @HandleErrorSecondaryAsync()
  async ban(member: GuildMember, reason: string, embed: EmbedBuilder) {
    if (!member || !reason || !embed)
      throw new Error('One of arguments was not provided!');

    await this.sendDmEmbed(member, embed);

    return await member.ban({ reason });
  }

  @HandleErrorSecondaryAsync()
  async unban(member: GuildMember, reason: string) {
    if (!member || !reason)
      throw new Error('One of arguments was not provided!');

    return await this.guild.members.unban(member.user.id, reason);
  }

  async sendDmEmbed(member: GuildMember, content: EmbedBuilder) {
    const dm = await member.user.createDM();

    return await dm.send({ embeds: [content] });
  }

  @HandleErrorSecondaryAsync()
  async sendLog(logEmbed: EmbedBuilder) {
    if (!logEmbed) throw new Error('Log embed was not provided!');

    const channel = await this.getModerationLogsChannel();
    if (!channel) throw new Error('Channel was not provided!');

    return channel.send({ embeds: [logEmbed] });
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
