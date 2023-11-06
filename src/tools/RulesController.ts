import {
  CommandInteraction,
  EmbedBuilder,
  Guild,
  TextChannel,
  TextInputBuilder,
} from 'discord.js';
import { MainController } from './MainController';
import { DbNote } from '#types';

export class RulesController extends MainController {
  interaction: CommandInteraction;
  constructor(interaction: CommandInteraction, guild: Guild) {
    super(interaction, guild, process.env.RULES_COLLECTION_NAME);
    this.interaction = interaction;
  }

  getRulesEmbed(): EmbedBuilder {
    return new EmbedBuilder();
  }

  getRulesChannel(): TextChannel {
    const channelId = process.env.RULES_CHANNEL_ID;
    if (!channelId) throw new Error('Rules channel id does not exist!');

    const channel = this.interaction.guild!.channels.cache.get(
      channelId
    ) as TextChannel;
    if (!channel) throw new Error('Rules channel does not exist!');

    return channel;
  }

  getRulesLogChannel(): TextChannel {
    const channelId = process.env.RULES_LOGS_CHANNEL_ID;
    if (!channelId) throw new Error('Rules log channel id does not exist!');

    const channel = this.interaction.guild!.channels.cache.get(
      channelId
    ) as TextChannel;
    if (!channel) throw new Error('Rules log channel does not exist!');

    return channel;
  }

  async rulesSender(embed: EmbedBuilder) {
    if (!embed) throw new Error('Embed was not provided!');

    const channel = this.getRulesChannel();
    if (!channel)
      throw new Error('Something went wrong. Rules channel does not exist!');

    return await this.embedSender(embed, channel);
  }

  async rulesEditor(embed: EmbedBuilder, messageId: string) {
    if (!embed || !messageId) throw new Error('Embed was not provided!');

    const channel = this.getRulesChannel();
    if (!channel)
      throw new Error('Something went wrong. Rules channel does not exist!');

    return await this.embedUpdate(embed, channel, messageId);
  }

  async rulesRemover(messageId: string) {
    if (!messageId) throw new Error('Message id was not provided!');

    const channel = this.getRulesChannel();
    if (!channel)
      throw new Error('Something went wrong. Rules channel does not exist!');

    const message = await channel.messages.fetch(messageId);
    if (!message) throw new Error('Message does not exist!');

    return await message.delete();
  }

  async rulesLogCreate(embed: EmbedBuilder) {
    if (!embed) throw new Error('Embed was not provided! [rulesLogCreate]');

    const channel = this.getRulesLogChannel();
    if (!channel)
      throw new Error(
        'Something went wrong. Rules log channel does not exist!'
      );

    return await this.embedSender(embed, channel);
  }

  async rulesLogUpdate(embed: EmbedBuilder, logId: string) {
    if (!embed || !logId)
      throw new Error('Embed or logId were not provided! [rulesLogUpdate]');

    const channel = this.getRulesLogChannel();
    if (!channel)
      throw new Error(
        'Something went wrong. Rules log channel does not exist!'
      );

    return await this.embedUpdate(embed, channel, logId);
  }

  async getModal(data: TextInputBuilder) {
    if (!data) throw new Error('Data was not provided, [getModal (Rules)]');

    return await this.modalCreate(data);
  }
}
