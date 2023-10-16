import { CustomError } from '@/types';

export function format_error(error: CustomError, from: string) {
  if (!error.from) error.from = [from];
  else error.from.push(from);
}
