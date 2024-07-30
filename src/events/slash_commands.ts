import { InteractionTemplate } from '@/config/templates';
import { HandleErrorAsync, InteractionCreate } from '@/decorators';
import { SlashLoader } from '@/loaders';
import {
  CommandInteraction,
  GuildMemberRoleManager,
  PermissionsBitField,
} from 'discord.js';

@InteractionCreate()
class Event extends InteractionTemplate {
  constructor(interaction: CommandInteraction) {
    super(interaction);
    this.execute(interaction);
  }

  @HandleErrorAsync()
  async execute(interaction: CommandInteraction) {
    if (!interaction.isCommand()) return;

    const command_name = interaction.commandName;

    const command_data = SlashLoader.get_command(command_name);

    // const slash_permissions = await this.guild_settings.slash_permissions();
    const slash_permissions = JSON.parse(process.env.DEV!)
      ? command_data?.dev_permissions
      : command_data?.permissions;

    if (slash_permissions) {
      const { allowed_roles, restricted_roles, permissions } =
        slash_permissions;

      const member = interaction.member;
      const roles = (member?.roles as GuildMemberRoleManager).cache;

      let access = false;
      console.log(allowed_roles && allowed_roles[0]);

      if (allowed_roles && allowed_roles[0])
        access = !!allowed_roles.filter((role_id) => roles.has(role_id))[0];
      else if (restricted_roles && restricted_roles[0])
        access = !restricted_roles.filter((role_id) => roles.has(role_id))[0];
      else if (permissions && permissions[0])
        access = !permissions.find(
          (perm) =>
            !(interaction.member?.permissions as PermissionsBitField).has(perm)
        );
      else access = true;

      if (!access)
        return this.replyFalseH("You don't have permissions for this command");
    }

    if (!command_data) return this.replyFalseH("⚠️ This command doesn't exist");

    SlashLoader.invoke(command_data.data.name, interaction);
  }
}
