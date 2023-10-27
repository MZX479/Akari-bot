import { InteractionTemplate } from '@/config/templates';
import { HandleErrorSecondaryAsync, Slash } from '@/decorators';
import { MainController } from '@/tools/MainController';

import {
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  SlashCommandNumberOption,
  SlashCommandStringOption,
  TextInputBuilder,
} from 'discord.js';

@Slash({
  data: new SlashCommandBuilder()
    .setName('create-bounty')
    .setDescription('Create a bounty using this command.')
    .addNumberOption(
      new SlashCommandNumberOption()
        .setName('reward')
        .setDescription('reward for this card.')
        .setRequired(true)
    )
    .addStringOption(
      new SlashCommandStringOption()
        .setName('card')
        .setDescription('Specify description of the character/card you want.')
        .setMaxLength(50)
    )
    .toJSON(),
  type: 'Utility',
})
class Command extends InteractionTemplate {
  interaction: CommandInteraction;
  logicController: MainController;
  constructor(interaction: CommandInteraction) {
    super(interaction);
    this.interaction = interaction;
    this.logicController = new MainController(interaction, interaction.guild!);
    this.execute();
  }

  private async execute() {}

  @HandleErrorSecondaryAsync()
  async callModal(data: TextInputBuilder) {
    if (!data) throw new Error('Data was not provided!');

    return await this.logicController.modalCreate(data);
  }

  @HandleErrorSecondaryAsync()
  async getEmbed() {
    return await this.logicController.getEmbed();
  }

  @HandleErrorSecondaryAsync()
  async sendBountyEmbed(embed: EmbedBuilder) {}

  @HandleErrorSecondaryAsync()
  async logSender() {}

  @HandleErrorSecondaryAsync()
  async dbNoteAdd() {}
}
