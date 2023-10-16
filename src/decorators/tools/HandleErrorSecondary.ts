import { format_error } from '@/tools';
import { CustomError } from '@/types';

export function HandleErrorSecondary(from?: string) {
  return function <This, Args extends any[], Return>(
    target: (this: This, ...args: Args) => Return,
    context: ClassMethodDecoratorContext
  ) {
    return function (this: This, ...args: Args) {
      try {
        return target.call(this, ...args);
      } catch (err) {
        const __error_handle_name = (this as any).__error_handle_name;
        if (!from)
          from = `[${
            __error_handle_name || (this as any).constructor.name
          }] ${String(context.name)}`;

        format_error(err as CustomError, from);
        throw err;
      }
    };
  };
}

export function HandleErrorSecondaryAsync(from?: string) {
  return function <This, Args extends any[], Return>(
    target: (this: This, ...args: Args) => Promise<Return>,
    context: ClassMethodDecoratorContext
  ) {
    return async function (this: This, ...args: Args) {
      try {
        return await target.call(this, ...args);
      } catch (err) {
        const __error_handle_name = (this as any).__error_handle_name;
        if (!from)
          from = `[${
            __error_handle_name || (this as any).constructor.name
          }] ${String(context.name)}`;

        format_error(err as CustomError, from);
        throw err;
      }
    };
  };
}
