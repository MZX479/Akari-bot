import {
  DecoratedClassType,
  MessageDecoratorArgsType,
  MessageDecoratorPlate,
  MessageLoaderCommandType,
} from '@/types';
import { MessageLoader } from '@/loaders/MessageLoader';

/** @description Message class as message prefix command */
export function PrefixMessage(data: MessageDecoratorArgsType) {
  return function <This, Args extends any[]>(
    target: DecoratedClassType<This, Args> & MessageDecoratorPlate,
    context: ClassDecoratorContext
  ) {
    target.prototype.__error_handle_name = `prefix-commands ${data.data.name}`;

    const loader_args: MessageLoaderCommandType = {
      command: target,
      payload: data,
    };
    MessageLoader.load(loader_args);
  };
}
