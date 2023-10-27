import { MessageTemplate } from '@/config/templates/MessageTemplate';
import { PrefixMessage } from '@/decorators';
import { discharge } from '@/tools';
import {
  EmbedBuilder,
  Message,
  PermissionsBitField,
  TextChannel,
} from 'discord.js';

@PrefixMessage({
  data: {
    name: 'clear',
  },
  type: 'Utility',
})
class Command extends MessageTemplate {
  private readonly max_amount: 100 = 100;
  private messageArgs: Array<string>;
  constructor(message: Message) {
    super(message);
    this.messageArgs = this.msgArgs();
    this.execute(message, this.messageArgs);
  }

  async execute(message: Message, args: Array<string>) {
    if (
      !(message.member!.permissions as Readonly<PermissionsBitField>).has(
        'ManageMessages'
      )
    ) {
      return await this.replyFalse(
        'You do not have permissions for this command!'
      );
    }

    let amount = Number(args[0]);
    if (!amount)
      return await this.replyFalse('You did not specified amount of messages!');
    if (isNaN(amount)) {
      return await this.replyFalse('Specified number is wrong!');
    }

    if (amount <= 0 || amount > 100) {
      return await this.replyFalse(
        `Specified messages amount cannot be under 0 or more than ${discharge(
          this.max_amount
        )}`
      );
    }

    amount += 1;

    const toDelete = await (message.channel! as TextChannel).messages.fetch({
      limit: amount,
    });

    const deleted_messages = await (message.channel as TextChannel).bulkDelete(
      toDelete
    );

    const resultMsg = await message.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor('Aqua')
          .setAuthor({
            name: message.author.username,
            iconURL: message.author.displayAvatarURL(),
          })
          .setDescription(
            `> **You successfully deleted \`${
              deleted_messages.size - 1
            }\` messages!**`
          )
          .setTimestamp(new Date()),
      ],
    });

    setTimeout(async () => {
      await resultMsg.delete().catch((e) => undefined);
    }, 5000);
  }
}
