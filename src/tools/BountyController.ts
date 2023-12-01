import {
  CommandInteraction,
  EmbedBuilder,
  Guild,
  TextChannel,
  TextInputBuilder,
} from 'discord.js';
import { MainController } from './MainController';
import { DbNote } from '#types';
import { HandleErrorSecondary, HandleErrorSecondaryAsync } from '@/decorators';

export class BountyController extends MainController {
  interaction: CommandInteraction;
  constructor(interaction: CommandInteraction, guild: Guild) {
    super(interaction, guild, process.env.BOUNTY_COLLECTION_NAME);
    this.interaction = interaction;
  }

  @HandleErrorSecondary()
  getBountyEmbed(): EmbedBuilder {
    return new EmbedBuilder();
  }

  @HandleErrorSecondary()
  getBountyChannel(): TextChannel {
    const channelId = process.env.BOUNTY_CHANNEL_ID;
    if (!channelId) throw new Error('Bounty channel id does not exist!');

    const channel = this.interaction.guild!.channels.cache.get(
      channelId
    ) as TextChannel;
    if (!channel) throw new Error('Bounty channel does not exist!');

    return channel;
  }

  @HandleErrorSecondary()
  private getBountyLogChannel(): TextChannel {
    const channelId = process.env.BOUNTY_LOGS_CHANNEL_ID;
    if (!channelId) throw new Error('Bounty log channel id does not exist!');

    const channel = this.interaction.guild!.channels.cache.get(
      channelId
    ) as TextChannel;
    if (!channel) throw new Error('Bounty log channel does not exist!');

    return channel;
  }

  @HandleErrorSecondaryAsync()
  async bountySender(embed: EmbedBuilder) {
    if (!embed) throw new Error('Embed was not provided!');

    const channel = this.getBountyChannel();
    if (!channel)
      throw new Error('Something went wrong. Bounty channel does not exist!');

    return await this.embedSender(embed, channel);
  }

  @HandleErrorSecondaryAsync()
  async bountyEditor(embed: EmbedBuilder, messageId: string) {
    if (!embed || !messageId) throw new Error('Embed was not provided!');

    const channel = this.getBountyChannel();
    if (!channel)
      throw new Error('Something went wrong. Bounty channel does not exist!');

    return await this.embedUpdate(embed, channel, messageId);
  }

  @HandleErrorSecondaryAsync()
  async bountyRemover(messageId: string) {
    if (!messageId) throw new Error('Message id was not provided!');

    const channel = this.getBountyChannel();
    if (!channel)
      throw new Error('Something went wrong. Bounty channel does not exist!');

    const message = await channel.messages.fetch(messageId);
    if (!message) throw new Error('Message does not exist!');

    return await message.delete();
  }

  @HandleErrorSecondaryAsync()
  async getBountyDbNote(msgId: string) {
    if (!msgId) throw new Error('MsgId was not provided!');

    return await this.getDbNote({ msgId });
  }

  @HandleErrorSecondaryAsync()
  async createBountyDbNote(data: DbNote) {
    if (!data)
      throw new Error('Data was not provided, [createBountyDbNotel (Bounty)]');

    return await this.createDbNote(data);
  }

  @HandleErrorSecondaryAsync()
  async updateBountyDbNote(data: DbNote) {
    if (!data)
      throw new Error('Data was not provided, [updateBountyDbNotel (Bounty)]');

    return await this.updateDbNoteByMsgId(data.msgId as string, data.content);
  }

  @HandleErrorSecondaryAsync()
  async bountyLogCreate(embed: EmbedBuilder) {
    if (!embed) throw new Error('Embed was not provided! [bountyLogCreate]');

    const channel = this.getBountyLogChannel();
    if (!channel)
      throw new Error(
        'Something went wrong. Bounty log channel does not exist!'
      );

    return await this.embedSender(embed, channel);
  }

  @HandleErrorSecondaryAsync()
  async bountyLogUpdate(embed: EmbedBuilder, logId: string) {
    if (!embed || !logId)
      throw new Error('Embed or logId were not provided! [bountyLogUpdate]');

    const channel = this.getBountyLogChannel();
    if (!channel)
      throw new Error(
        'Something went wrong. Bounty log channel does not exist!'
      );

    return await this.embedUpdate(embed, channel, logId);
  }

  @HandleErrorSecondaryAsync()
  async getModal(data: TextInputBuilder) {
    if (!data) throw new Error('Data was not provided, [getModal (Bounty)]');

    return await this.modalCreate(data);
  }
}
