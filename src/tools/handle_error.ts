import config from '@/config/config';
import { CustomError } from '@/types';
import { Logger } from '@/config/LoggerLoader';
import { client } from '@/Main';
import { EmbedBuilder, TextBasedChannel, TextChannel } from 'discord.js';

/** @description Log error to console and write one to error file */
export function handle_error<T extends object>(
  err: CustomError,
  from: string,
  data?: T
) {
  console.error(err);
  Logger.error(err);

  const errors_channel = client.channels.cache.get(config.errors_channel) as
    | TextBasedChannel
    | undefined;

  if (err.from) err.from.push(from);

  const view_from = err.from ? err.from.reverse().join(' ↓\n') : from;

  const result = [
    {
      name: `🛠️ Place:`,
      value: `>>> \`${view_from}\``,
    },
    {
      name: '📄 Error description:',
      value: `\`\`\`${err.toString()}\`\`\``,
    },
  ];

  if (data)
    try {
      result.push({
        name: '📌 Extra:',
        value: `\`\`\`${JSON.stringify(data, null, '\t')}\`\`\``,
      });
    } catch (e) {
      result.push({
        name: '📌 Extra:',
        value: `\`\`\`An error occured via handling parameters!\`\`\``,
      });
    }

  const error_embed = new EmbedBuilder()
    .setTitle('⚠️ An unexpected error occured:')
    .addFields(...result)
    .setColor('#DF1515');

  if (!errors_channel) {
    const owner = client.users.cache.get(config.owner);
    if (!owner)
      return console.error("[handle_error] Channel for erros doesn't defined");
    owner.send({
      content: `> :warning: Errors channel was not provided!\n\n`,
      embeds: [error_embed],
    });

    return;
  }

  (errors_channel as TextChannel).send({
    embeds: [error_embed],
  });
}
