import { taskType, updateType } from '#types';
import { InteractionTemplate } from '@/config/templates';
import {
  HandleErrorAsync,
  HandleErrorSecondary,
  HandleErrorSecondaryAsync,
  Slash,
} from '@/decorators';
import { PlannerController } from '@/tools/PlannerController';

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  CommandInteraction,
  EmbedBuilder,
  Guild,
  GuildMember,
  SlashCommandBuilder,
  SlashCommandStringOption,
} from 'discord.js';

@Slash({
  data: new SlashCommandBuilder()
    .setName('edit-task-status')
    .setDescription('edit your task')
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
    const authorId = (this.interaction.member as GuildMember).user.id;
    const taskId = this.get_argument('task-id').value as string;

    const getTask = await this.getTaskFromDb(authorId, taskId);
    if (!getTask)
      return await this.replyFalseH('Task with this id does not exist!');

    const taskEmbed = this.getEmptyEmbed();
    taskEmbed.setColor(Colors.Green);
    taskEmbed.setTitle('Task preview:');
    taskEmbed
      .addFields(
        { name: '🔤 Task Name:', value: `\`${getTask.name}\``, inline: true },
        { name: '\u200b', value: `\u200b`, inline: true },
        { name: '1️⃣ Task Id:', value: `\`${getTask.taskId}\``, inline: true },
        { name: '🔰 Task Status:', value: `\`${getTask.status}\``, inline: true },
        { name: '\u200b', value: `\u200b`, inline: true },
        {
          name: '💬 Task Description:',
          value: `\`${getTask.description}\``,
          inline: true,
        }
      )
      .setFooter({ text: 'Choose status below:' })
      .setTimestamp(new Date());

    const previewReply = await this.createButtonReply(taskEmbed)
    if(!previewReply) return await this.send({content: '> `Time is up!`', components: [], embeds: []})


    switch (previewReply.customId) {
      case 'success':
        await this.updateTask(authorId, taskId, 'successful');
        previewReply.reply({
          content: '`Status was successfully changed!`',
          components: [],
        });
        break;
      case 'failed':
        await this.updateTask(authorId, taskId, 'failed');
        previewReply.reply({
          content: '`Status was successfully changed!`',
          components: [],
        });
        break;
      case 'cancel':
        previewReply.reply({
          content: '`See you!`',
          components: [],
        });
        break;
      default:
        break;
    }
  }

  @HandleErrorSecondary()
  getEmptyEmbed(): EmbedBuilder {
    return this.plannerController.getEmbed();
  }

  @HandleErrorSecondaryAsync()
  async getTaskFromDb(authorId: string, taskId: string) {
    if (!authorId || !taskId)
      throw new Error('Author id or task id were not provided!!');

    return await this.plannerController.getTaskFromDb(authorId, taskId);
  }

  @HandleErrorSecondaryAsync()
  async updateTask(
    authorId: string,
    taskId: string,
    status: taskType['status']
  ) {
    if (!authorId || !taskId || !status)
      throw new Error('One of arguments were not provided!');

    await this.plannerController.updateTaskStatus(authorId, taskId, status);
  }

  @HandleErrorSecondary()
  getStatusButtons(): ButtonBuilder[] {
    const buttons = [
      new ButtonBuilder()
        .setStyle(ButtonStyle.Success)
        .setLabel('Successful')
        .setCustomId('success'),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setLabel('Failed')
        .setCustomId('failed'),
      new ButtonBuilder()
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Secondary)
        .setCustomId('cancel')
    ];

    return buttons;
  }

  @HandleErrorSecondaryAsync()
  async createButtonReply(taskEmbed: EmbedBuilder) {
    const statusButtons = this.getStatusButtons();
    if (!statusButtons) throw new Error('Status buttons do not exist!');

    const reply = await this.send({
      embeds: [taskEmbed],
      components: [
        new ActionRowBuilder().addComponents(...statusButtons),
      ] as any,
      ephemeral: true,
    }).catch()

    const answer = reply.awaitMessageComponent({ time: 20000 }).catch(() => undefined)

    return await answer
  }
}
