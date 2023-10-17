import { bountyLogType, giveawayLogType, rulesLogType } from '#types';
import { InteractionTemplate } from '@/config/templates';
import { HandleErrorSecondaryAsync } from '@/decorators';
import {
  Colors,
  CommandInteraction,
  EmbedBuilder,
  TextChannel,
  time,
} from 'discord.js';
import { discharge } from '@/tools';

export class EmbedLogger extends InteractionTemplate {
  interaction: CommandInteraction;
  constructor(interaction: CommandInteraction) {
    super(interaction);
    this.interaction = interaction;
  }

  @HandleErrorSecondaryAsync()
  async rulesLogger(data: rulesLogType) {
    if (!data) throw new Error('Rules log data was not provided!');

    const channelId = process.env.RULES_LOGS_CHANNEL_ID;
    if (!channelId) throw new Error('Rules Logs channel id does not exist!');

    const channel = this.interaction.guild!.channels.cache.get(channelId);
    if (!channel) throw new Error('Rules logs channel does not exist!');

    const { title, content, author, logId } = data;

    const logEmbed = new EmbedBuilder()
      .setTitle(title)
      .setColor(author.roles.highest.color || Colors.Red)
      .setAuthor({
        name: author.nickname ? author.nickname : author.user.username,
        iconURL: author.displayAvatarURL(),
      })
      .setThumbnail(author.displayAvatarURL())
      .addFields(
        {
          name: 'Author',
          value: `> <@${author.user.id}>`,
        },
        {
          name: 'Content',
          value: `> \`${content}\``,
        },
        {
          name: 'Log id',
          value: `> \`${logId}\``,
        }
      )
      .setTimestamp(new Date())
      .setFooter({ text: 'Created at ' });

    return await (channel as TextChannel).send({ embeds: [logEmbed] });
  }

  @HandleErrorSecondaryAsync()
  async giveawayLogger(data: giveawayLogType) {
    if (!data) throw new Error('Giveaway log data was not provided!');

    const { creator, sponsor, card, timer, description, logId } = data;

    const channelId = process.env.GIVEAWAY_LOGS_CHANNEL_ID;
    if (!channelId) throw new Error('GiveAway logs channel id does not exist!');

    const channel = this.interaction.guild!.channels.cache.get(channelId);
    if (!channel) throw new Error('GiveAway logs channel does not exist!');

    const logEmbed = new EmbedBuilder()
      .setTitle('Giveaway posted:')
      .setColor(sponsor.roles.highest.color || Colors.Aqua)
      .setThumbnail(sponsor.displayAvatarURL())
      .addFields(
        { name: 'Creator', value: `> <@${creator.user.id}>` },
        { name: 'Sponsor(s)', value: `> <@${sponsor.user.id}>` },
        { name: 'Time', value: `> ${time(new Date(timer), 'R')}` },
        { name: 'Card', value: `> \`${card}\`` },
        { name: 'Description', value: `> \`${description}\`` },
        { name: 'Log id', value: `> \`${logId}\`` }
      )
      .setTimestamp(new Date())
      .setFooter({ text: 'Created at ' });

    return await (channel as TextChannel).send({ embeds: [logEmbed] });
  }

  @HandleErrorSecondaryAsync()
  async bountyLogger(data: bountyLogType) {
    if (!data) throw new Error('Bounty log data was not provided!');

    const { author, card, bounty, description, logId } = data;

    const channelId = process.env.BOUNTY_LOGS_CHANNEL_ID;
    if (!channelId) throw new Error('Bounty logs channel id does not exist!');

    const channel = this.interaction.guild!.channels.cache.get(channelId);
    if (!channel) throw new Error('Bounty logs channel does not exist!');

    const logEmbed = new EmbedBuilder()
      .setTitle('Bounty posted:')
      .setColor(author.roles.highest.color || Colors.DarkGold)
      .setAuthor({
        name: author.nickname ? author.nickname : author.user.username,
        iconURL: author.displayAvatarURL(),
      })
      .setThumbnail(
        'https://cdn.discordapp.com/attachments/1163811631357235241/1163813528663228500/Screenshot_151.png?ex=6540f0cf&is=652e7bcf&hm=e79c99d82c3d039bc5c6ec2a65d155f289bb34d60b8742e8d06cd2a661aa9d5c&'
      )
      .addFields(
        { name: 'Author', value: `> <@${author.user.id}>` },
        { name: 'Card', value: `> \`${card}\`` },
        { name: 'Bounty', value: `> ${discharge(bounty)} **Ticket(s)**` },
        { name: 'Description', value: `> \`${description}\`` },
        { name: 'Log id', value: `> \`${logId}\`` }
      )
      .setTimestamp(new Date())
      .setFooter({ text: 'Created at ' });

    return await (channel as TextChannel).send({ embeds: [logEmbed] });
  }
}
