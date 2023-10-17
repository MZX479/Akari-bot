import {
  CustomError,
  MessageDecoratorPlate,
  MessageLoaderCommandType,
} from '#types';
import { config } from '@/Main';
import { Logger } from '@/config/LoggerLoader';
import { format_error } from '@/tools';
import { Message } from 'discord.js';

export class _MessageLoader {
  private _commands_list: MessageLoaderCommandType[] = [];

  /** @description Get array of Slash commands payloads data */
  get commands() {
    return this._commands_list.map((command) => command.payload);
  }

  /** @description Get command payload data */
  get_command(name: string): MessageLoaderCommandType['payload'] | undefined {
    return this.commands.filter(
      (command) => command.data.name.toLowerCase() === name.toLowerCase()
    )[0];
  }

  invoke(name: string, message: Message) {
    try {
      Logger.log(
        `Получена новая префикс комманда ${name} от пользователя ${message.author.id} на сервере ${message.guild?.id}`
      );
      const command_to_invoke = this._commands_list.filter(
        (command) => command.payload.data.name === name
      )[0];

      if (!command_to_invoke)
        return Logger.error(`/-комманда ${name} не найдена`);

      Logger.log(`Найдена /-комманда ${name}`);
      Logger.log(`Перехожу к вызову комманды`);
      new command_to_invoke.command(message);
    } catch (e) {
      format_error(e as CustomError, '[loader SlashLoader]');
    }
  }

  load(MessageDecorator: MessageLoaderCommandType) {
    const { allowed_modules } = config;
    const command_module = MessageDecorator.payload.type;

    if (JSON.parse(process.env.DEV!)) {
      if (MessageDecorator.payload.dev_disabled) return;
    } else if (MessageDecorator.payload.disabled) return;

    if (!allowed_modules.includes(command_module)) return;
    this._commands_list.push(MessageDecorator);
  }
}

export const MessageLoader = new _MessageLoader();
