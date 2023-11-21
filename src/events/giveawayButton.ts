import { DbNote } from '#types';
import { InteractionTemplate } from '@/config/templates';
import {
  HandleErrorAsync,
  HandleErrorSecondaryAsync,
  InteractionCreate,
} from '@/decorators';
import { GiveawayController } from '@/tools/GiveawayController';
import { CommandInteraction, Interaction } from 'discord.js';

@InteractionCreate()
class Event extends InteractionTemplate {
  giveawaysController: GiveawayController;
  constructor(interaction: CommandInteraction) {
    super(interaction);
    this.giveawaysController = new GiveawayController(
      interaction,
      interaction.guild!
    );
    this.execute(interaction);
  }

  @HandleErrorAsync()
  async execute(interaction: CommandInteraction) {
    const inter = interaction as Interaction;
    if (!inter.isButton()) return;
    if (inter.customId !== 'participate') return;

    const msgId = inter.message.id;

    const data = await this.getData(msgId);

    if (!data) throw new Error('Giveaway data does not exist!');

    const { author, content } = data;

    if (content.giveawayParticipants?.includes(author)) {
      content.giveawayParticipants.splice(
        content.giveawayParticipants.indexOf(author)
      );
      await interaction.reply({ content: '**You left!**', ephemeral: true });
      await this.updateData({ author, content });
      return;
    }

    content.giveawayParticipants!.push(inter.user.id);

    await this.updateData({ author, content });
    await interaction.reply({ content: '**Done!**', ephemeral: true });
  }

  @HandleErrorSecondaryAsync()
  async getData(msgId: string) {
    if (!msgId) throw new Error('msgId was not provided!');

    return await this.giveawaysController.getGiveawayDbNote(msgId);
  }

  @HandleErrorSecondaryAsync()
  async updateData(data: DbNote) {
    if (!data) throw new Error('Data was not provided!');

    return await this.giveawaysController.updateGiveawayDbNote(data);
  }
}
