import { CustomError } from '#types';
import { format_error } from './FormatError';

export function format_time(time: number) {
  try {
    if (!time || isNaN(time)) throw new Error('Время не передано');
    const diff = time;

    const diff_days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const diff_hours = Math.floor(diff / (1000 * 60 * 60));
    const diff_mins = Math.floor(diff / (1000 * 60));
    const diff_secs = Math.floor(diff / 1000);
    const days = diff_days;
    const hours = diff_hours - diff_days * 24;
    const minutes = diff_mins - diff_hours * 60;
    const seconds = diff_secs - diff_mins * 60;
    const label_days = days === 0 ? '' : `${days} дня(-ей) `;
    const label_hours = hours === 0 ? '' : `${hours} часа(-ов) `;
    const label_minuts = minutes === 0 ? '' : `${minutes} минут(-ы) `;
    const label_seconds = seconds === 0 ? '' : `${seconds} секунд(-ы) `;

    const label = [label_days, label_hours, label_minuts, label_seconds]
      .join(' ')
      .trim();

    return label;
  } catch (e) {
    format_error(e as CustomError, '[tool format_time]');
    throw e;
  }
}
