import { MessageTemplate } from '@/config/templates/MessageTemplate copy';
import { HandleErrorAsync, MessageCreate } from '@/decorators';
import { MessageLoader } from '@/loaders/MessageLoader';
import { GuildMemberRoleManager, Message } from 'discord.js';

@MessageCreate()
class Event extends MessageTemplate {
  constructor(message: Message) {
    super(message);
    this.execute(message);
  }

  @HandleErrorAsync()
  async execute(message: Message) {
    if (!message.content.startsWith(process.env.PREFIX!)) return;

    const command_name = message.content
      .replace(process.env.PREFIX!, '')
      .split(' ')[0];

    const command_data = MessageLoader.get_command(command_name);

    // const slash_permissions = await this.guild_settings.slash_permissions();
    const slash_permissions = JSON.parse(process.env.DEV!)
      ? command_data?.dev_permissions
      : command_data?.permissions;

    if (slash_permissions) {
      const { allowed_roles, restricted_roles } = slash_permissions;

      const member = message.member;
      const roles = (member?.roles as GuildMemberRoleManager).cache;

      let access = false;
      console.log(allowed_roles && allowed_roles[0]);

      if (allowed_roles && allowed_roles[0])
        access = !!allowed_roles.filter((role_id) => roles.has(role_id))[0];
      else if (restricted_roles && restricted_roles[0])
        access = !restricted_roles.filter((role_id) => roles.has(role_id))[0];
      else access = true;

      if (!access)
        return this.replyFalse("You don't have permissions for this command");
    }

    if (!command_data) return this.replyFalse("⚠️ This command doesn't exist");

    MessageLoader.invoke(command_data.data.name, message);
  }
}
