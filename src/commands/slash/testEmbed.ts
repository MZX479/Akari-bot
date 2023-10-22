import { InteractionTemplate } from '@/config/templates';
import { Slash } from '@/decorators';
import { EmbedLogger } from '@/tools/MainController';

import { CommandInteraction, Guild, GuildMember } from 'discord.js';

@Slash({
  data: {
    name: 'testembed',
    description: 'tests an embed.',
  },
  type: 'Utility',
})
class Command extends InteractionTemplate {
  interaction: CommandInteraction;
  embedLogger: EmbedLogger;

  constructor(interaction: CommandInteraction) {
    super(interaction);
    this.interaction = interaction;
    this.embedLogger = new EmbedLogger(interaction);
    this.execute();
  }

  private async execute() {
    return await this.replyTrue('Done');
  }
}
