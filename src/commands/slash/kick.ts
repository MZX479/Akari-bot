import { DbNote, moderationLogType, violationsType } from '#types';
import { client } from '@/Main';
import { InteractionTemplate } from '@/config/templates';
import { Slash } from '@/decorators';
import { ModerationController } from '@/tools/ModerationController';

import {
  Colors,
  CommandInteraction,
  EmbedBuilder,
  Guild,
  GuildMember,
  ModalBuilder,
  SlashCommandBuilder,
  SlashCommandMentionableOption,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';

@Slash({
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('kick a member using this command')
    .addMentionableOption(
      new SlashCommandMentionableOption()
        .setName('member')
        .setDescription('provide a member')
        .setRequired(true)
    )
    .toJSON(),
  type: 'Utility',
})
class Command extends InteractionTemplate {
  interaction: CommandInteraction;
  author: GuildMember;
  moderationController: ModerationController;

  constructor(interaction: CommandInteraction) {
    super(interaction);
    this.interaction = interaction;
    this.author = interaction.member as GuildMember;
    this.moderationController = new ModerationController(
      interaction.guild as Guild
    );
    this.execute();
  }

  private async execute() {
    const member = this.get_argument('member').member as GuildMember;

    if (member.user.id === this.author.user.id)
      return await this.replyFalseH('You cannot kick yourself, silly!');

    if (member.user.id === client.user!.id)
      return await this.replyFalseH('You cannot kick the bot!');

    if (member.roles.highest.position >= this.author.roles.highest.position)
      return await this.replyFalseH('You cannot manage specified user');

    const inputField = new TextInputBuilder()
      .setLabel('Describe a reason.')
      .setCustomId('description')
      .setMinLength(10)
      .setMaxLength(300)
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const modalWindow = this.getModal(inputField);
    if (!modalWindow)
      return await this.replyFalseH('Modal window does not exist!');

    await this.interaction.showModal(modalWindow);

    const modalSubmit = await this.interaction.awaitModalSubmit({
      filter: (submit) => submit.user.id === this.author.user.id,
      time: 600000,
    });

    let description = modalSubmit.fields.fields.get('description')?.value;
    if (!description) throw new Error('Description does not exist!');

    const kickEmbed = this.getEmbed()
      .setColor(Colors.Red)
      .setTitle('You have been kicked from Karuta Hangout!')
      .addFields(
        { name: 'Moderator', value: `<@${this.author.user.id}>` },
        { name: 'Reason', value: `\`${description}\`` }
      )
      .setTimestamp(new Date());

    await this.kick(member, description, kickEmbed);

    const kick: violationsType = {
      type: 'kick',
      moderator: this.author.user.id,
      reason: description,
      time: new Date(),
    };

    const logEmbed = this.logCreate({
      title: 'Kick',
      member,
      moderator: this.author,
      description,
      time: new Date(),
    });

    const getDbNote = await this.moderationController.getDbNote(member.user.id);
    if (!getDbNote) {
      const violations = [];
      violations.push(kick);

      await this.createDbNote({
        author: member.user.id,
        content: { violations },
      });
    } else {
      const violations = getDbNote.content.violations;
      if (!violations) throw new Error('Violations do not exist!');
      violations.push(kick);

      await this.updateDbNote({
        author: member.user.id,
        content: { violations },
      });
    }

    await this.logSend(logEmbed);

    await modalSubmit.reply({ content: `**Member was successfully kicked!**` });

    description = '';

    setTimeout(() => modalSubmit.deleteReply(), 5000);
  }

  getEmbed(): EmbedBuilder {
    return this.moderationController.getEmbed();
  }

  async kick(member: GuildMember, reason: string, embed: EmbedBuilder) {
    if (!member || !reason || !embed)
      throw new Error('One of arguments not provided!');

    return await this.moderationController.kick(member, reason, embed);
  }

  async createDbNote(data: DbNote) {
    if (!data) throw new Error('Data was not provided!');

    return await this.moderationController.createDbNote(data);
  }

  async updateDbNote(data: DbNote) {
    if (!data) throw new Error('Data was not provided!');

    return await this.moderationController.editDbNote(data);
  }

  logCreate(data: moderationLogType): EmbedBuilder {
    if (!data) throw new Error('Data was not provided!');

    const { title, description, member, moderator } = data;

    const embed = this.getEmbed()
      .setColor(Colors.Red)
      .setTitle(title)
      .setThumbnail(member.displayAvatarURL())
      .addFields(
        {
          name: 'Moderator/Administrator',
          value: `<@${moderator.user.id}>, ID - \`${moderator.user.id}\``,
        },
        {
          name: 'Member',
          value: `<@${member.user.id}>, ID - \`${member.user.id}\``,
        },
        {
          name: 'Reason',
          value: `\`${description}\``,
        }
      )
      .setTimestamp(new Date());

    return embed;
  }

  async logSend(embed: EmbedBuilder) {
    if (!embed) throw new Error('Embed was not provided!');

    return await this.moderationController.sendLog(embed);
  }

  getModal(input: TextInputBuilder): ModalBuilder {
    if (!input) throw new Error('Input was not provided!');

    return this.moderationController.modalCreate(input);
  }
}
