import { DbNote, moderationLogType, warnType } from '#types';
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
    .setName('warn')
    .setDescription('warn a member using this command.')
    .addMentionableOption(
      new SlashCommandMentionableOption()
        .setName('member')
        .setDescription('provide a member')
        .setRequired(true)
    )
    .toJSON(),
  type: 'Moderation',
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
    if (this.author.user.id === member.user.id)
      return await this.replyFalseH('You cannot warn yourself :D');

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

    const warnEmbed = this.getEmbed()
      .setColor(Colors.Red)
      .setTitle('You have been warned!')
      .addFields(
        { name: 'Moderator', value: `<@${this.author.user.id}>` },
        { name: 'Reason', value: `\`${description}\`` }
      )
      .setFooter({ text: 'Be careful next time!' })
      .setTimestamp(new Date());

    await this.warn(member, warnEmbed);

    const logEmbed = this.createLog({
      title: 'Warning',
      member,
      moderator: this.author,
      description,
      time: new Date(),
    });

    const warn: warnType = {
      moderator: this.author.user.id,
      reason: description,
      time: new Date(),
    };

    const getDbNote = await this.moderationController.getDbNote(member.user.id);
    if (!getDbNote) {
      const warns = [];
      warns.push(warn);

      await this.createDbNote({
        author: member.user.id,
        content: { warns },
      });
    } else {
      const warns = getDbNote.content.warns;
      if (!warns) throw new Error('Warns do not exist!');
      warns.push(warn);

      await this.updateDbNote({
        author: member.user.id,
        content: { warns },
      });
    }

    await this.sendLog(logEmbed);

    await modalSubmit.reply({ content: `**Warn successfully sent!**` });

    description = '';

    setTimeout(() => modalSubmit.deleteReply(), 5000);
  }

  getEmbed(): EmbedBuilder {
    return this.moderationController.getEmbed();
  }

  async warn(member: GuildMember, embed: EmbedBuilder) {
    if (!member || !embed)
      throw new Error('Member or reason was not provided!');

    return await this.moderationController.warn(member, embed);
  }

  createLog(data: moderationLogType): EmbedBuilder {
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

  async createDbNote(data: DbNote) {
    if (!data) throw new Error('Data was not provided!');

    return await this.moderationController.createDbNote(data);
  }

  async updateDbNote(data: DbNote) {
    if (!data) throw new Error('Data was not provided!');

    return await this.moderationController.editDbNote(data);
  }

  async sendLog(logEmbed: EmbedBuilder) {
    if (!logEmbed) throw new Error('Log embed was not provided');

    return await this.moderationController.sendLog(logEmbed);
  }

  getModal(input: TextInputBuilder): ModalBuilder {
    if (!input) throw new Error('Input was not provided!');

    return this.moderationController.modalCreate(input);
  }
}
