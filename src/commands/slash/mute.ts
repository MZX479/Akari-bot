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
  SlashCommandStringOption,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import parse from 'parse-duration';

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
    .addStringOption(
      new SlashCommandStringOption()
        .setName('time')
        .setDescription('Specify time of ban. Examples: 1h; 1d; 7d; 30d')
        .setRequired(true)
    )
    .toJSON(),
  type: 'Moderation',
  permissions: {
    allowed_roles: ['1162139543781265498', '1163749369229615175'],
  },
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
    const time = this.get_argument('time').value as string;
    const parsedTime = parse(time);
    if (!parsedTime) return;
    const newTime = new Date().getTime() + parsedTime;

    if (member.user.id === this.author.user.id)
      return await this.replyFalseH('You cannot warn yourself, silly!');

    if (member.user.id === client.user!.id)
      return await this.replyFalseH('You cannot warn the bot!');

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

    const warnEmbed = this.getEmbed()
      .setColor(Colors.Red)
      .setTitle('You have been warned on Karuta Hangout!')
      .addFields(
        { name: 'Moderator', value: `<@${this.author.user.id}>` },
        { name: 'Reason', value: `\`${description}\`` }
      )
      .setTimestamp(new Date());

    await this.mute(member, warnEmbed);

    const logEmbed = this.createLog({
      title: 'Mute',
      member,
      moderator: this.author,
      description,
      time: new Date(),
    });

    const mute: violationsType = {
      type: 'mute',
      moderator: this.author.user.id,
      reason: description,
      time: new Date(),
      timeOfPunishment: newTime,
    };

    const getDbNote = await this.moderationController.getDbNote(member.user.id);
    if (!getDbNote) {
      const violations = [];
      violations.push(mute);

      await this.createDbNote({
        author: member.user.id,
        content: { violations },
      });
    } else {
      const violations = getDbNote.content.violations;
      if (!violations) throw new Error('Violations do not exist!');
      violations.push(mute);

      await this.updateDbNote({
        author: member.user.id,
        content: { violations },
      });
    }

    await this.sendLog(logEmbed);

    await modalSubmit.reply({
      content: `**Member was successfully muted for \`${time}\`!**`,
    });

    description = '';

    setTimeout(() => modalSubmit.deleteReply(), 5000);
  }

  getEmbed(): EmbedBuilder {
    return this.moderationController.getEmbed();
  }

  async mute(member: GuildMember, embed: EmbedBuilder) {
    if (!member || !embed)
      throw new Error('Member or reason was not provided!');

    return await this.moderationController.mute(member, embed);
  }

  createLog(data: moderationLogType): EmbedBuilder {
    if (!data) throw new Error('Data was not provided!');

    const { title, description, member, moderator, timeOfPunishmentNoParse } =
      data;

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
        },
        {
          name: 'Time',
          value: `\`${timeOfPunishmentNoParse}\``,
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
