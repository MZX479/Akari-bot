import { InteractionTemplate } from '@/config/templates';
import { Slash } from '@/decorators';
import { EmbedLogger } from '@/tools/EmbedLoggerController';

import { CommandInteraction, GuildMember } from 'discord.js';

@Slash({
  data: {
    name: 'test1',
    description: 'dasdas',
  },
  type: 'Utility',
})
class Command extends InteractionTemplate {
  interaction: CommandInteraction;
  embedLogger: EmbedLogger;

  constructor(interaction: CommandInteraction) {
    super(interaction);
    this.interaction = interaction;
    this.embedLogger = new EmbedLogger(interaction, this.interaction.guild!);
    this.execute();
  }

  private async execute() {
    await this.embedLogger.logger({
      author: this.interaction.member as GuildMember,
      content: 'testestetsetstestestetsetets',
      title: 'test',
      time: new Date(),
    });

    return await this.replyTrue('Done!');
  }
}
