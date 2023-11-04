import {
  CommandInteraction,
  EmbedBuilder,
  Guild,
  TextChannel,
  TextInputBuilder,
} from 'discord.js';
import { MainController } from './MainController';
import { DbNote } from '#types';

export class GiveawayController extends MainController {
  interaction: CommandInteraction;
  constructor(interaction: CommandInteraction, guild: Guild) {
    super(interaction, guild, process.env.GIVEAWAY_COLLECTION_NAME);
    this.interaction = interaction;
  }

  getGiveawayEmbed(): EmbedBuilder {
    return new EmbedBuilder();
  }

  getGiveawayChannel(): TextChannel {
    const channelId = process.env.GIVEAWAY_CHANNEL_ID;
    if (!channelId) throw new Error('Giveaway channel id does not exist!');

    const channel = this.interaction.guild!.channels.cache.get(
      channelId
    ) as TextChannel;
    if (!channel) throw new Error('Giveaway channel does not exist!');

    return channel;
  }

  getGiveawayLogChannel(): TextChannel {
    const channelId = process.env.GIVEAWAY_LOGS_CHANNEL_ID;
    if (!channelId) throw new Error('Giveaway log channel id does not exist!');

    const channel = this.interaction.guild!.channels.cache.get(
      channelId
    ) as TextChannel;
    if (!channel) throw new Error('Giveaway log channel does not exist!');

    return channel;
  }

  async giveawaySender(embed: EmbedBuilder) {
    if (!embed) throw new Error('Embed was not provided!');

    const channel = this.getGiveawayChannel();
    if (!channel)
      throw new Error('Something went wrong. Giveaway channel does not exist!');

    return await this.embedSender(embed, channel);
  }

  async giveawayEditor(embed: EmbedBuilder, messageId: string) {
    if (!embed || !messageId) throw new Error('Embed was not provided!');

    const channel = this.getGiveawayChannel();
    if (!channel)
      throw new Error('Something went wrong. Giveaway channel does not exist!');

    return await this.embedUpdate(embed, channel, messageId);
  }

  async giveawayRemover(messageId: string) {
    if (!messageId) throw new Error('Message id was not provided!');

    const channel = this.getGiveawayChannel();
    if (!channel)
      throw new Error('Something went wrong. Giveaway channel does not exist!');

    const message = await channel.messages.fetch(messageId);
    if (!message) throw new Error('Message does not exist!');

    return await message.delete();
  }

  async createGiveawayDbNote(data: DbNote) {
    if (!data)
      throw new Error(
        'Data was not provided, [createGiveawayDbNotel (Giveaway)]'
      );

    return await this.createDbNote(data);
  }

  async updateGiveawayDbNote(data: DbNote) {
    if (!data)
      throw new Error(
        'Data was not provided, [updateGiveawayDbNotel (Giveaway)]'
      );

    return await this.updateDbNote(data);
  }

  async giveawayLogCreate(embed: EmbedBuilder) {
    if (!embed) throw new Error('Embed was not provided! [giveawayLogCreate]');

    const channel = this.getGiveawayLogChannel();
    if (!channel)
      throw new Error(
        'Something went wrong. Giveaway log channel does not exist!'
      );

    return await this.embedSender(embed, channel);
  }

  async giveawayLogUpdate(embed: EmbedBuilder, logId: string) {
    if (!embed || !logId)
      throw new Error('Embed or logId were not provided! [giveawayLogUpdate]');

    const channel = this.getGiveawayLogChannel();
    if (!channel)
      throw new Error(
        'Something went wrong. Giveaway log channel does not exist!'
      );

    return await this.embedUpdate(embed, channel, logId);
  }

  async getModal(data: TextInputBuilder) {
    if (!data) throw new Error('Data was not provided, [getModal (Giveaway)]');

    return await this.modalCreate(data);
  }
}
