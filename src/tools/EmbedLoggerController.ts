import { logType } from '#types';
import { InteractionTemplate } from '@/config/templates';
import { HandleErrorSecondaryAsync } from '@/decorators';
import {
  CommandInteraction,
  EmbedBuilder,
  Guild,
  TextChannel,
} from 'discord.js';
import { v4 as randomId } from 'uuid';

export class EmbedLogger extends InteractionTemplate {
  interaction: CommandInteraction;
  constructor(interaction: CommandInteraction, guild: Guild) {
    super(interaction);
    this.interaction = interaction;
  }

  @HandleErrorSecondaryAsync()
  async logger(data: logType) {
    if (!data) throw new Error('logData was not provided!');

    const channel = this.interaction.guild!.channels.cache.get(
      process.env.LOGS_CHANNEL_ID!
    );
    if (!channel) throw new Error('Logs channel does not exist!');

    const { title, content, author, time } = data;

    const logEmbed = new EmbedBuilder()
      .setTitle(title)
      .setAuthor({
        name: author.nickname ? author.nickname : author.user.username,
        iconURL: author.displayAvatarURL(),
      })
      .setThumbnail(this.interaction.guild!.members.me!.displayAvatarURL())
      .addFields(
        {
          name: 'Author',
          value: `>>> **nickname: \`${
            author.nickname ? author.nickname : 'none'
          }\`, ID: \`${author.id}\`, userTag: \`${author.user.tag}\`**`,
          inline: false,
        },
        {
          name: 'Content',
          value: `>>> \`${content}\``,
          inline: false,
        },
        {
          name: 'Log id',
          value: `>>> \`${randomId()}\``,
          inline: false,
        }
      )
      .setTimestamp(time)
      .setFooter({ text: 'Created at ' });

    return await (channel as TextChannel).send({ embeds: [logEmbed] });
  }
}
