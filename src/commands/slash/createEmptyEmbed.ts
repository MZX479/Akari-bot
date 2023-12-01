import { InteractionTemplate } from '@/config/templates';
import {
  HandleErrorAsync,
  HandleErrorSecondary,
  HandleErrorSecondaryAsync,
  Slash,
} from '@/decorators';
import { colors } from '@/tools';

import {
  ColorResolvable,
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  SlashCommandStringOption,
  TextChannel,
} from 'discord.js';

@Slash({
  data: new SlashCommandBuilder()
    .setName('create-empty-embed')
    .setDescription('create small embed with only title')
    .addStringOption(
      new SlashCommandStringOption()
        .setName('color')
        .setDescription('provide a color')
        .setChoices(...colors)
        .setRequired(true)
    )
    .addStringOption(
      new SlashCommandStringOption()
        .setName('channel-id')
        .setDescription('provide a channel id')
        .setRequired(true)
    )
    .toJSON(),
  type: 'Utility',
  permissions: {
    allowed_roles: ['1162139543781265498', '1163749369229615175'],
  },
})
class Command extends InteractionTemplate {
  interaction: CommandInteraction;

  constructor(interaction: CommandInteraction) {
    super(interaction);
    this.interaction = interaction;
    this.execute();
  }

  @HandleErrorAsync()
  private async execute() {
    const channelId = this.get_argument('channel-id').value as string;
    const color = this.get_argument('color').value as string;

    const embed = this.createEmbed().setColor(color as ColorResolvable);

    const channel = (await this.interaction.guild!.channels.fetch(
      channelId
    )) as TextChannel;

    await this.sendEmbed(embed, channel);

    const reply = await this.replyTrue(
      '**Embed created and sent successfully!**'
    );

    setTimeout(() => reply.delete(), 5000);
  }

  @HandleErrorSecondary()
  createEmbed(): EmbedBuilder {
    return new EmbedBuilder();
  }

  @HandleErrorSecondaryAsync()
  async sendEmbed(embed: EmbedBuilder, channel: TextChannel) {
    if (!embed || !channel)
      throw new Error(
        'Embed or channel were not provided! [ sendEmbed (createTitleEmbed)]'
      );

    return await channel.send({ embeds: [embed] });
  }
}
