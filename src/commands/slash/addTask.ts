import { taskType } from '#types';
import { InteractionTemplate } from '@/config/templates';
import {
  HandleErrorAsync,
  HandleErrorSecondary,
  HandleErrorSecondaryAsync,
  Slash,
} from '@/decorators';
import { PlannerController } from '@/tools/PlannerController';
import {
  CommandInteraction,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { uid } from 'uid';

@Slash({
  data: new SlashCommandBuilder()
    .setName('add-task')
    .setDescription('add a personal task')
    .toJSON(),
  type: 'Utility',
})
class Command extends InteractionTemplate {
  interaction: CommandInteraction;
  plannerController: PlannerController;

  constructor(interaction: CommandInteraction) {
    super(interaction);
    this.interaction = interaction;
    this.plannerController = new PlannerController(this.interaction.guild!);
    this.execute();
  }

  @HandleErrorAsync()
  private async execute() {
    const inputField = new TextInputBuilder()
      .setLabel('Describe your task.')
      .setCustomId('description')
      .setMinLength(5)
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const modalWindow = this.getModal(inputField);

    if (!modalWindow)
      return await this.replyFalseH('Modal window does not exist!');

    await this.interaction.showModal(modalWindow);

    const modalSubmit = await this.interaction.awaitModalSubmit({
      filter: (submit) => submit.user.id === this.interaction.user.id,
      time: 600000,
    });

    let description = modalSubmit.fields.fields.get('description')?.value;
    if (!description) throw new Error('Description does not exist!');

    const newTask: taskType = {
      creationTime: new Date().getTime(),
      taskId: uid(32),
      description,
      status: 'open',
    };

    await this.addTask(this.interaction.user.id, newTask);

    await modalSubmit.reply({ content: '`Successfully added!`' });

    description = '';

    setTimeout(() => modalSubmit.deleteReply(), 5000);
  }

  @HandleErrorSecondaryAsync()
  async addTask(authorId: string, task: taskType) {
    if (!authorId || !task) throw new Error('Task was not provided!');

    return await this.plannerController.addTask(authorId, task);
  }

  @HandleErrorSecondary()
  getModal(data: TextInputBuilder) {
    if (!data) throw new Error('Data was not provided!');

    return this.plannerController.modalCreate(data);
  }
}
