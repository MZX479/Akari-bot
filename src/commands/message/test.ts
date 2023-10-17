// export {};

import { MessageTemplate } from '@/config/templates/MessageTemplate copy';
import { PrefixMessage } from '@/decorators';
import { Message } from 'discord.js';

@PrefixMessage({
  data: {
    name: 'status',
  },
  type: 'Utility',
})
class StatusMessage extends MessageTemplate {
  constructor(message: Message) {
    super(message);
    this.execute(message);
  }

  async execute(message: Message) {
    await this.replyTrue('Чпок чпок');
  }
}
