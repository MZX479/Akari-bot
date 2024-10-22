import { InteractionTemplate } from '@/config/templates';
import { HandleErrorAsync, HandleErrorSecondary, HandleErrorSecondaryAsync, Slash } from '@/decorators';
import { PlannerController } from '@/tools/PlannerController';

import { ButtonBuilder, ButtonStyle, CommandInteraction, EmbedBuilder, Guild, GuildMember, ModalBuilder, SlashCommandBuilder, SlashCommandStringOption, TextInputBuilder, TextInputStyle } from 'discord.js';

@Slash({
  data: new SlashCommandBuilder()
    .setName('edit-task-description')
    .setDescription('edit your task description')
    .addStringOption(
      new SlashCommandStringOption()
        .setName('task-id')
        .setDescription('provide a task id')
        .setRequired(true)
    )
    .toJSON(),
  type: 'Utility',
})
class Command extends InteractionTemplate {
  interaction: CommandInteraction;
  plannerController: PlannerController;

  constructor(interaction: CommandInteraction) {
    super(interaction);
    this.interaction = interaction;
    this.plannerController = new PlannerController(interaction.guild as Guild);
    this.execute();
  }

  @HandleErrorAsync()
  private async execute() {
    const authorId = (this.interaction.member as GuildMember).user.id
    const taskId = this.get_argument('task-id').value as string

    const task = await this.getTask(authorId, taskId)

    if(!task) return await this.replyFalseH('Task with this id does not exist!')
    if(task.originalAuthor !== authorId) return await this.replyFalseH('You can not edit this task!')

    const inputField = new TextInputBuilder()
      .setLabel('Create new desccription')
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

    await this.updateTask(authorId, taskId, description)

    await modalSubmit.reply({content: '> **Description was successfully updated!**', ephemeral: true})
  }

  @HandleErrorSecondary()
  getEmbed(): EmbedBuilder {
    return this.plannerController.getEmbed()
  }

  @HandleErrorSecondaryAsync()
  async getTask(authorId: string, taskId: string) {
    if(!authorId || !taskId) throw new Error('Author id or task id were not provided!')

    return await this.plannerController.getTaskFromDb(authorId, taskId)
  }

  @HandleErrorSecondaryAsync()
  async updateTask(authorId: string, taskId: string, description: string) {
    if (!authorId || !taskId || !description) throw new Error('One or more arguments were not provided!')

    return await this.plannerController.updateTaskDescription(authorId, taskId, description);
  }

  @HandleErrorSecondary()
  getModal(input: TextInputBuilder): ModalBuilder {
    return this.plannerController.modalCreate(input)
  }
}