import { plannerType, taskType } from '#types';
import { InteractionTemplate } from '@/config/templates';
import { HandleErrorAsync, HandleErrorSecondary, HandleErrorSecondaryAsync, Slash } from '@/decorators';
import { PlannerController } from '@/tools/PlannerController';

import { Colors, CommandInteraction, EmbedBuilder, Guild, GuildMember, SlashCommandBuilder } from 'discord.js';

@Slash({
  data: new SlashCommandBuilder()
    .setName('view-tasks')
    .setDescription('use this command to view your tasks')
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

    const dbNote = await this.getDbNote(author.user.id)
    if(!dbNote) return await this.replyFalseH('You do not have any tasks!')

    const askEmbed = await this.createTasksEmbed(author, dbNote.tasks)
    await this.send({embeds: [askEmbed], ephemeral: true})
  }

  @HandleErrorSecondary()
  getEmbed(): EmbedBuilder {
    return this.plannerController.getEmbed()
  }

  @HandleErrorSecondary()
  createTasksEmbed(author: GuildMember, tasks: plannerType['tasks']): EmbedBuilder {
    if(!author || !tasks) throw new Error('Author or tasks were not provided!')

    let count = 1

    const embed = this.getEmbed()
    embed.setColor(Colors.Aqua)
    embed.setAuthor({name: author.user.username, iconURL: author.user.displayAvatarURL()})
    embed.setThumbnail(author.user.displayAvatarURL())
    embed.setFooter({text: 'If you wanna see more info, use view-task slash command with task id'})
    embed.setTimestamp(new Date())

    for (let task of tasks) {
      embed.addFields({name: `:large_blue_diamond: \`${count++})\``, value:`\`Task name:\` **${task.name}**\n\`Task id:\` **${task.taskId}**`})
    }

    return embed
  }

  @HandleErrorSecondaryAsync()
  async getDbNote(authorId: string): Promise<plannerType> {
    if(!authorId) throw new Error('Author id was not provided!')

    return await this.plannerController.getDbNote(authorId);
  }
}