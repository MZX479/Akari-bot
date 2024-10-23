import { taskType } from '#types';
import { InteractionTemplate } from '@/config/templates';
import { HandleErrorAsync, HandleErrorSecondary, HandleErrorSecondaryAsync, Slash } from '@/decorators';
import { PlannerController } from '@/tools/PlannerController';

import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, CommandInteraction, EmbedBuilder, Guild, GuildMember, SlashCommandBuilder, SlashCommandStringOption, time } from 'discord.js';

@Slash({
  data: new SlashCommandBuilder()
    .setName('delete-task')
    .setDescription('delete your task')
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
  plannerController: PlannerController

  constructor(interaction: CommandInteraction) {
    super(interaction);
    this.interaction = interaction;
    this.plannerController = new PlannerController(interaction.guild as Guild)
    this.execute();
  }

  @HandleErrorAsync()
  private async execute() {
    const author = this.interaction.member as GuildMember
    const taskId = this.get_argument('task-id').value as string

    const getTask = await this.getTask(author.user.id, taskId)

    const checkButtons = this.getButtons()
    const checkEmbed = this.getCheckEmbed(author, getTask)

    const checkReply = await this.createButtonReply(checkEmbed, checkButtons)
    if(!checkReply) return

    switch (checkReply.customId) {
      case 'delete':
        await this.deleteTask(author.user.id, taskId)
        await this.send({content: `> Task with id: \`${taskId}\` was succesfully deleted!`, components: [], embeds: [], ephemeral: true})
        break;
      case 'cancel':
        await this.send({content: '> See you!', components: [], embeds: [],  ephemeral: true})
        break;
      default:
        break;
    }
  }

  @HandleErrorSecondaryAsync()
  async createButtonReply(embed: EmbedBuilder, buttons: ButtonBuilder[]) {
    if(!embed || !buttons) throw new Error('Embed or buttons were not provided!')

    const createReply = await this.send({embeds: [embed], components: [new ActionRowBuilder().addComponents(...buttons)] as any, ephemeral: true})

    const answer  = await createReply.awaitMessageComponent({
      time: 60000
    }).catch(() => undefined)

    return answer
  }

  @HandleErrorSecondary()
  getEmbed(): EmbedBuilder {
    return this.plannerController.getEmbed()
  }

  @HandleErrorSecondary()
  getCheckEmbed(author: GuildMember, task: taskType): EmbedBuilder {
    if(!author || !task) throw new Error('Author or task was not provided!')

    const { creationTime, description, name, status, taskId } = task 

    const embed = this.getEmbed()
    .setColor(Colors.Red)
    .setTitle('Double check!')
    .setAuthor({name: author.user.username, iconURL: author.user.displayAvatarURL()})
    .setFooter({text: 'Are you sure?'})
    .addFields(
      { name: '🔤 Task Name:', value: `\`${name}\``, inline: true },
      { name: '\u200b', value: `\u200b`, inline: true },
      { name: '1️⃣ Task Id:', value: `\`${taskId}\``, inline: true },
      { name: '🔰 Task Status:', value: `\`${status}\``, inline: true },
      { name: '\u200b', value: `\u200b`, inline: true },
      {
        name: '💬 Task Description:',
        value: `\`${description}\``,
        inline: true,
      },
      {name: '🕐 Created:', value: `${time(new Date(creationTime), 'R')}`, inline: true}
    )
    .setTimestamp(new Date())

    return embed
  }

  @HandleErrorSecondary()
  getButtons(): ButtonBuilder[] {
    const buttons = [
      new ButtonBuilder()
      .setLabel('Delete')
      .setStyle(ButtonStyle.Danger)
      .setCustomId('delete'),
      new ButtonBuilder()
      .setLabel('Cancel')
      .setStyle(ButtonStyle.Primary)
      .setCustomId('cancel')
    ]

    return buttons
  }

  @HandleErrorSecondaryAsync()
  async getTask(authorId: string, taskId: string) {
    if(!authorId || !taskId) throw new Error('Author id or task id were not provided!')

    return await this.plannerController.getTaskFromDb(authorId, taskId)
  }

  @HandleErrorSecondaryAsync()
  async deleteTask(authorId: string, taskId: string) {
    if(!authorId || !taskId) throw new Error('Author id or task id were not provided!')

    return await this.plannerController.deleteTask(authorId, taskId)
  }
}