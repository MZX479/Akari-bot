import { DbNote } from '#types';
import { InteractionTemplate } from '@/config/templates';
import { HandleErrorAsync, InteractionCreate } from '@/decorators';
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
    console.log(data);

    if (!data) throw new Error('Giveaway data does not exist!');

    const { author, content } = data;
    console.log(inter.user.id);

    content.giveawayParticipants!.push(inter.user.id);

    await this.updateData({ author, content });
    await interaction.reply('done');
  }

  async getData(msgId: string) {
    if (!msgId) throw new Error('msgId was not provided!');

    return await this.giveawaysController.getGiveawayDbNote(msgId);
  }

  async updateData(data: DbNote) {
    if (!data) throw new Error('Data was not provided!');

    return await this.giveawaysController.updateGiveawayDbNote(data);
  }
}
