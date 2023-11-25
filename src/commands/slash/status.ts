import { InteractionTemplate } from '@/config/templates';
import { HandleErrorAsync, Slash } from '@/decorators';
import { client } from '@/Main';
import { discharge } from '@/tools';
import {
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  time,
} from 'discord.js';

@Slash({
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription("Show bot's status")
    .toJSON(),
  type: 'Utility',
})
class Command extends InteractionTemplate {
  private interaction: CommandInteraction;

  constructor(interaction: CommandInteraction) {
    super(interaction);
    this.interaction = interaction;
    this.execute();
  }

  @HandleErrorAsync()
  async execute() {
    const status_embed = new EmbedBuilder()
      .setAuthor({
        name: `♾️ Bot status ${client.user?.tag}`,
        iconURL: client.user?.displayAvatarURL(),
      })
      .setColor('#732ADC')
      .addFields([
        {
          name: '❕ Status',
          value: 'Alive',
          inline: true,
        },
        {
          name: '\u200b',
          value: `\u200b`,
          inline: true,
        },
        {
          name: '🏓 latency',
          value: discharge(client.ws.ping),
          inline: true,
        },
        {
          name: '🕰️ Started',
          value: time(client.readyAt!, 'D') + ` ` + time(client.readyAt!, 'T'),
          inline: true,
        },
        {
          name: '\u200b',
          value: `\u200b`,
          inline: true,
        },
        {
          name: '⏲️ Started at',
          value: time(client!.readyAt!, 'R'),
          inline: true,
        },
      ])
      .setFooter({
        text: `Version: ${process.env.npm_package_version}`,
      });

    this.send({
      embeds: [status_embed],
    });
  }
}
