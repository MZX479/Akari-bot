import { MessageTemplate } from '@/config/templates/MessageTemplate';
import { HandleErrorSecondaryAsync, PrefixMessage } from '@/decorators';
import { Colors, EmbedBuilder, Guild, GuildMember, Message } from 'discord.js';

@PrefixMessage({
  data: {
    name: 'ping',
  },
  type: 'Utility',
})
class StatusMessage extends MessageTemplate {
  author: GuildMember;
  private messageArgs: Array<string>;
  constructor(message: Message) {
    super(message);
    this.author = this.message.member as GuildMember;
    this.messageArgs = this.msgArgs();
    this.execute(message, this.messageArgs);
  }

  async execute(message: Message, args: Array<string>) {
    const embed = await this.getEmbed();
    if (!embed) throw new Error('Embed does not exist!');

    return await this.replyEmbed(embed);
  }

  @HandleErrorSecondaryAsync()
  async replyEmbed(embed: EmbedBuilder) {
    if (!embed) throw new Error('Embed was not provided!');

    return await this.send({ embeds: [embed] });
  }

  @HandleErrorSecondaryAsync()
  async getEmbed() {
    return new EmbedBuilder()
      .setTitle('Check')
      .setColor(Colors.Green)
      .setDescription('> **Pong!**')
      .setTimestamp(new Date())
      .setFooter({
        text: `Requested by ${this.author.user.username}`,
        iconURL: this.author.displayAvatarURL(),
      });
  }
}
