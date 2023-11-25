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

    const messageId = inter.message.id;
    const member = inter.user.id;

    const data = await this.getData(messageId);

    if (!data) throw new Error('Giveaway data does not exist!');

    const { content } = data;

    if (content.giveawayParticipants?.includes(member)) {
      content.giveawayParticipants?.splice(
        content.giveawayParticipants?.indexOf(member)
      );
      await interaction.reply({
        content: '**You left the giveaway!**',
        ephemeral: true,
      });
      return await this.updateData(messageId, data);
    }

    content.giveawayParticipants?.push(inter.user.id);

    await this.updateData(messageId, data);
    await interaction.reply({
      content: `**<@${member}>, you were added to the list of participants. \n If you want to leave - just press the button again!**`,
      ephemeral: true,
    });
  }

  @HandleErrorSecondaryAsync()
  async getData(msgId: string) {
    if (!msgId) throw new Error('msgId was not provided!');

    return await this.giveawaysController.getGiveawayDbNote(msgId);
  }

  @HandleErrorSecondaryAsync()
  async updateData(msgId: string, content: DbNote) {
    if (!msgId || !content) throw new Error('Data was not provided!');

    return await this.giveawaysController.updateGiveawayDbNote(msgId, content);
  }
}
