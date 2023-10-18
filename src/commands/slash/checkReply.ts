import { InteractionTemplate } from '@/config/templates';
import {
  HandleErrorAsync,
  HandleErrorSecondaryAsync,
  Slash,
} from '@/decorators';

import {
  Colors,
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  User,
} from 'discord.js';

@Slash({
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Simple command for checking reply system.')
    .toJSON(),
  type: 'Utility',
})
class Command extends InteractionTemplate {
  interaction: CommandInteraction;
  author: User;

  constructor(interaction: CommandInteraction) {
    super(interaction);
    this.interaction = interaction;
    this.author = this.interaction.user;
    this.execute();
  }

  @HandleErrorAsync()
  private async execute() {
    const embed = await this.getEmbed();
    if (!embed) return await this.replyFalseH('Embed does not exist!');

    await this.replyEmbed(embed);
  }

  @HandleErrorSecondaryAsync()
  async replyEmbed(embed: EmbedBuilder) {
    if (!embed) throw new Error('Embed was not provided!');

    return await this.send({ embeds: [embed] });
  }

  @HandleErrorSecondaryAsync()
  async getEmbed() {
    return new EmbedBuilder()
      .setTitle('Check')
      .setColor(Colors.Green)
      .setDescription('> **Pong!**}')
      .setTimestamp(new Date())
      .setFooter({
        text: `Requested by ${this.author.username}`,
        iconURL: this.author.displayAvatarURL(),
      });
  }
}
