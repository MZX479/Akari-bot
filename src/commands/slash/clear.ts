import { InteractionTemplate } from '@/config/templates';
import { PermissionsBitField, TextChannel } from 'discord.js';
import { HandleErrorAsync, Slash } from '@/decorators';

import { CommandInteraction } from 'discord.js';
import { discharge } from '@/tools';

@Slash({
  data: {
    name: 'clear',
    description: 'Clears specified amount of messages',
    options: [
      {
        name: 'amount',
        description: 'Specify amount of message to delete',
        type: 4,
        required: true,
      },
    ],
  },
  type: 'Utility',
})
class Command extends InteractionTemplate {
  private readonly max_amount: 100 = 100;
  interaction: CommandInteraction;

  constructor(interaction: CommandInteraction) {
    super(interaction);
    this.interaction = interaction;
    this.execute();
  }

  @HandleErrorAsync()
  private async execute() {
    if (
      !(
        this.interaction.member!.permissions as Readonly<PermissionsBitField>
      ).has('ManageMessages')
    ) {
      return await this.replyFalseH(
        'You do not have permissions for this command!'
      );
    }

    const amount = this.get_argument('amount').value as number;
    if (isNaN(amount)) {
      return await this.replyFalseH('Specified number is wrong!');
    }

    if (amount <= 0 || amount > 100) {
      return await this.replyFalseH(
        `Specified messages amount cannot be under 0 or more than ${discharge(
          this.max_amount
        )}`
      );
    }

    const toDelete = await (
      this.interaction.channel! as TextChannel
    ).messages.fetch({
      limit: amount,
    });

    const deleted_messages = await (
      this.interaction.channel as TextChannel
    ).bulkDelete(toDelete);

    await this.replyTrue(
      `You successfully deleted \`${deleted_messages.size}\` messages!`
    );

    setTimeout(async () => {
      await this.interaction.deleteReply().catch((e) => undefined);
    }, 5000);
  }
}
