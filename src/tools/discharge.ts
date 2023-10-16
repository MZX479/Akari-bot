import { CustomError } from '#types';
import { format_error } from './FormatError';

type options_type = {
  formatting?: boolean;
};

const default_options: options_type = {
  formatting: true,
};
/** @description Discharge number by symbols
 * @example 1000000 -> 1.000.000
 */
export function discharge(
  number: number,
  options: options_type = default_options
): string {
  try {
    if (!number && number !== 0) throw new Error('Аргумент не является числом');
    if (!Number.isInteger(number))
      throw new Error('Аргумент не является числом');

    const discharge_symbol = '.';

    const betweens_result = `${number}`;
    const result = betweens_result.replace(
      /(\d)(?=(\d\d\d)+([^\d]|$))/g,
      '$1' + discharge_symbol
    );

    const { formatting } = options;
    return formatting ? `\`${result}\`` : result;
  } catch (e) {
    format_error(e as CustomError, '[tool discharge]');
    throw e;
  }
}
