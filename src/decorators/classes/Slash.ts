import {
  DecoratedClassType,
  SlashDecoratorArgsType,
  SlashDecoratorPlate,
  SlashLoaderCommandType,
} from '@/types';
import { SlashLoader } from '@/loaders';
import { CommandInteraction } from 'discord.js';

/** @description Setup class as Slash command */
export function Slash(data: SlashDecoratorArgsType) {
  return function <This, Args extends any[]>(
    target: DecoratedClassType<This, Args> & SlashDecoratorPlate,
    context: ClassDecoratorContext
  ) {
    target.prototype.__error_handle_name = `/command ${data.data.name}`;

    const loader_args: SlashLoaderCommandType = {
      command: target,
      payload: data,
    };
    SlashLoader.load(loader_args);
  };
}
