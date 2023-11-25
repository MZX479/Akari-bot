import { CustomError, SlashLoaderCommandType } from '#types';
import { Logger } from '@/config/LoggerLoader';
import { config } from '@/Main';
import { format_error } from '@/tools';
import { CommandInteraction } from 'discord.js';

type mapped_type = SlashLoaderCommandType['payload'];

/** @description Slash commands loader */
class SlashBuilder {
  private _commands_list: SlashLoaderCommandType[] = [];

  /** @description Get array of Slash commands payloads data */
  get commands(): mapped_type[] {
    return this._commands_list.map((command) => command.payload);
  }

  /** @description Get command payload data */
  get_command(name: string): mapped_type | undefined {
    return this.commands.filter(
      (command) => command.data.name.toLowerCase() === name.toLowerCase()
    )[0];
  }

  invoke(name: string, interaction: CommandInteraction) {
    try {
      Logger.log(
        `Got a /-command ${name} from user ${interaction.user.id} on server ${interaction.guild?.id}`
      );
      const command_to_invoke = this._commands_list.filter(
        (command) => command.payload.data.name === name
      )[0];

      if (!command_to_invoke)
        return Logger.error(`/-command ${name} was not found!`);

      Logger.log(`Found /-command ${name}`);
      Logger.log(`Activating the command..`);
      new command_to_invoke.command(interaction);

      setTimeout(async () => {
        if (!interaction.replied) {
          Logger.log('No reply at first 4 seconds so deferReply was set!');

          await interaction.deferReply().catch((e) => {
            Logger.log('An error occured via trying to set deferReply');
          });
        }
      }, 4000);
    } catch (e) {
      format_error(e as CustomError, '[loader SlashLoader]');
    }
  }

  load(SlashDecorator: SlashLoaderCommandType) {
    const { allowed_modules } = config;
    const command_module = SlashDecorator.payload.type;

    if (JSON.parse(process.env.DEV!)) {
      if (SlashDecorator.payload.dev_disabled) return;
    } else if (SlashDecorator.payload.disabled) return;

    if (!allowed_modules.includes(command_module)) return;
    this._commands_list.push(SlashDecorator);
  }
}

export const SlashLoader = new SlashBuilder();
