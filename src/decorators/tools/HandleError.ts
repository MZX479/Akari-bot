import { handle_error } from '@/tools';
import { CustomError } from '@/types';

export function HandleError(from?: string) {
  return function <This, Args extends any[], Return>(
    target: (this: This, ...args: Args) => Return,
    context: ClassMethodDecoratorContext
  ) {
    return function (this: This, ...args: Args) {
      try {
        return target.call(this, ...args);
      } catch (err) {
        if ((this as any).unexpected_error) (this as any).unexpected_error();

        const __error_handle_name = (this as any).__error_handle_name;
        if (!from)
          from = `[${
            __error_handle_name || (this as any).constructor.name
          }] ${String(context.name)}`;

        handle_error(err as CustomError, from);
      }
    };
  };
}

export function HandleErrorAsync(from?: string) {
  return function <This, Args extends any[], Return>(
    target: (this: This, ...args: Args) => Promise<Return>,
    context: ClassMethodDecoratorContext
  ) {
    return async function (this: This, ...args: Args) {
      try {
        return await target.call(this, ...args);
      } catch (err) {
        if ((this as any).unexpected_error) (this as any).unexpected_error();

        const __error_handle_name = (this as any).__error_handle_name;
        if (!from)
          from = `[${
            __error_handle_name || (this as any).constructor.name
          }] ${String(context.name)}`;

        handle_error(err as CustomError, from);
      }
    };
  };
}
