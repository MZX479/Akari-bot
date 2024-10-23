import { taskType } from '#types';
import { InteractionTemplate } from '@/config/templates';
import { HandleErrorAsync, HandleErrorSecondary, HandleErrorSecondaryAsync, Slash } from '@/decorators';
import { PlannerController } from '@/tools/PlannerController';

import { Colors, CommandInteraction, EmbedBuilder, Guild, GuildMember, SlashCommandBuilder, SlashCommandStringOption, time } from 'discord.js';

@Slash({
  data: new SlashCommandBuilder()
    .setName('view-task')
    .setDescription('view your task sing this command')
    .addStringOption(
      new SlashCommandStringOption()
        .setName('task-id')
        .setDescription('provide a task id')
    )
    .toJSON(),
  type: 'Utility',
})
class Command extends InteractionTemplate {
  interaction: CommandInteraction;
  plannerController: PlannerController

  constructor(interaction: CommandInteraction) {
    super(interaction);
    this.interaction = interaction;
    this.plannerController = new PlannerController(interaction.guild as Guild)
    this.execute();
  }

  @HandleErrorAsync()
  private async execute() {
    const taskId = this.get_argument('task-id').value as string
    const author = this.interaction.member as GuildMember

    const task = await this.getTask(author.user.id, taskId)
    if (!task) return await this.replyFalseH('Task with this id does not exist')

    const resultEmbed = this.createTaskEmbed(author, task)
    if(!resultEmbed) throw new Error('Result embed does not exist!')

    await this.send({ embeds: [resultEmbed], ephemeral: true})
  }

  @HandleErrorSecondary()
  getEmbed() {
    return this.plannerController.getEmbed()
  }

  @HandleErrorSecondary()
  createTaskEmbed(author: GuildMember, task: taskType): EmbedBuilder {
    if(!author || !task) throw new Error('Author or task were not provided!')

    const embed = this.getEmbed()
    embed.setColor(Colors.Blue)
    embed.setAuthor({name: author.user.username, iconURL: author.user.displayAvatarURL()})
    embed.setThumbnail('https://png.pngtree.com/png-vector/20230102/ourmid/pngtree-sticky-pastel-notes-aesthetic-smooth-color-paper-png-image_6548936.png')
    embed.addFields({name: '📋 **Name:**', value: `\`${task.name}\``}, 
    {name: '🕐 **Created:**', value: `${time(new Date(task.creationTime), 'R')}`},
    {name: '🔰 **Status:**', value: `\`${task.status}\``}, 
    {name: '🔢 **Task id:**', value: `\`${task.taskId}\``},
    {name: '💬 **Description:**', value: `\`${task.description}\``}
  )
    embed.setTimestamp(new Date())

    return embed
  }

  @HandleErrorSecondaryAsync()
  async getTask(authorId: string, taskId: string) {
    if(!authorId || !taskId) throw new Error('Author id or task id were not provided!')

    return await this.plannerController.getTaskFromDb(authorId, taskId)
  }
}