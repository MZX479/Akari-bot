import { remindDbType } from '#types';
import { InteractionTemplate } from '@/config/templates';
import {
  HandleErrorAsync,
  HandleErrorSecondary,
  HandleErrorSecondaryAsync,
  Slash,
} from '@/decorators';
import { remindersController } from '@/tools/remController';
import { uid } from 'uid';

import {
  CommandInteraction,
  GuildMember,
  SlashCommandBuilder,
  SlashCommandStringOption,
  TextInputBuilder,
  TextInputStyle,
  time,
} from 'discord.js';
import parse from 'parse-duration';

@Slash({
  data: new SlashCommandBuilder()
    .setName('set-reminder')
    .setDescription('provide a description and set your reminder')
    .addStringOption(
      new SlashCommandStringOption()
        .setName('timer')
        .setDescription(
          'provide a time for giveaway. Example: (hours - 1h, 2h), (days - 1d, 2d)'
        )
        .setRequired(true)
    )
    .toJSON(),
  type: 'Utility',
})
class Command extends InteractionTemplate {
  interaction: CommandInteraction;
  author: GuildMember;
  reminderController: remindersController;

  constructor(interaction: CommandInteraction) {
    super(interaction);
    this.interaction = interaction;
    this.author = interaction.member as GuildMember;
    this.reminderController = new remindersController(interaction.guild!);
    this.execute();
  }

  @HandleErrorAsync()
  private async execute() {
    const timer = this.get_argument('timer').value as string;

    const inputField = new TextInputBuilder()
      .setLabel('Describe character/card you want.')
      .setCustomId('description')
      .setMinLength(3)
      .setMaxLength(300)
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const modalWindow = this.getModal(inputField);
    if (!modalWindow)
      return await this.replyFalseH('Modal window does not exist!');

    await this.interaction.showModal(modalWindow);

    const modalSubmit = await this.interaction.awaitModalSubmit({
      filter: (submit) => submit.user.id === this.interaction.user.id,
      time: 600000,
    });

    let description = modalSubmit.fields.fields.get('description')?.value;
    if (!description) throw new Error('Description does not exist!');

    const parsedTime = parse(timer);
    if (!parsedTime) return;
    const newTime = new Date().getTime() + parsedTime;

    await this.createDbNote({
      authorId: this.author.id,
      timer: newTime,
      id: uid(25),
      status: 'active',
      content: description,
    });

    const reply = await modalSubmit.reply({
      content: `**Reminder has been set!**\n \`in ${timer}\``,
    });

    setTimeout(() => reply.delete(), 5000);
  }

  @HandleErrorSecondaryAsync()
  async createDbNote(note: remindDbType) {
    if (!note) throw new Error('Note was not provided!');

    return await this.reminderController.createReminderDbNote(note);
  }

  @HandleErrorSecondary()
  getModal(input: TextInputBuilder) {
    if (!input) throw new Error('Input was not provided!');

    return this.reminderController.modalCreate(input);
  }
}
