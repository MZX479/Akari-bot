import { rulesLogType, rulesType } from '#types';
import { InteractionTemplate } from '@/config/templates';
import {
  HandleErrorAsync,
  HandleErrorSecondary,
  HandleErrorSecondaryAsync,
  Slash,
} from '@/decorators';
import { RulesController } from '@/tools/RulesController';

import {
  Colors,
  CommandInteraction,
  EmbedBuilder,
  GuildMember,
  SlashCommandBuilder,
  SlashCommandStringOption,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';

@Slash({
  data: new SlashCommandBuilder()
    .setName('edit-rule')
    .setDescription('Edit a rule using this command.')
    .addStringOption(
      new SlashCommandStringOption()
        .setName('title')
        .setMaxLength(20)
        .setDescription('provide a rule title')
        .setRequired(true)
    )
    .addStringOption(
      new SlashCommandStringOption()
        .setName('message-id')
        .setDescription('provide a message id please')
        .setRequired(true)
    )
    .toJSON(),
  type: 'Utility',
  permissions: {
    allowed_roles: ['1162139543781265498', '1163749369229615175'],
  },
})
class Command extends InteractionTemplate {
  interaction: CommandInteraction;
  author: GuildMember;
  rulesController: RulesController;

  constructor(interaction: CommandInteraction) {
    super(interaction);
    this.interaction = interaction;
    this.author = interaction.member as GuildMember;
    this.rulesController = new RulesController(interaction, interaction.guild!);
    this.execute();
  }

  @HandleErrorAsync()
  private async execute() {
    const title = this.get_argument('title').value as string;
    const msgId = this.get_argument('message-id').value as string;

    const inputField = new TextInputBuilder()
      .setLabel('Describe new rule.')
      .setCustomId('description')
      .setMinLength(30)
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const modalWindow = await this.getModal(inputField);

    if (!modalWindow)
      return await this.replyFalseH('Modal window does not exist!');

    await this.interaction.showModal(modalWindow);

    const modalSubmit = await this.interaction.awaitModalSubmit({
      filter: (submit) => submit.user.id === this.interaction.user.id,
      time: 600000,
    });

    let description = modalSubmit.fields.fields.get('description')?.value;
    if (!description) throw new Error('Description does not exist!');

    const ruleEmbed = await this.createRuleEmbed({
      title,
      content: description,
    });

    if (!ruleEmbed) return await this.replyFalseH('Rule embed does not exist!');

    const ruleSender = await this.editRule(ruleEmbed, msgId);

    const ruleLogEmbed = await this.createRuleLog({
      title,
      description,
      msgId: ruleSender.id,
    });

    if (!ruleLogEmbed)
      return await this.replyFalseH('Log embed does not exist!');

    await this.sendRuleLog(ruleLogEmbed);

    await modalSubmit.reply({ content: '`Successfully edited!`' });

    description = '';

    setTimeout(() => modalSubmit.deleteReply(), 5000);
  }

  @HandleErrorSecondary()
  getEmbed(): EmbedBuilder {
    return this.rulesController.getEmbed();
  }

  @HandleErrorSecondaryAsync()
  async getMsgRule(msgId: string) {
    if (!msgId) throw new Error('msgId was not provided!');

    return await this.rulesController.getMessage(msgId);
  }

  @HandleErrorSecondaryAsync()
  async createRuleEmbed(data: rulesType): Promise<EmbedBuilder> {
    if (!data)
      throw new Error('Data was not provided [createRuleEmbed (createRule)]');

    const { title, content } = data;

    const embed = this.getEmbed()
      .setColor(Colors.Red)
      .setTitle(title)
      .setDescription(content)
      .setTimestamp(new Date());

    return embed;
  }

  @HandleErrorSecondaryAsync()
  async createRuleLog(data: rulesLogType): Promise<EmbedBuilder> {
    if (!data)
      throw new Error('Data was not provided [createRuleLog (createRule)]');

    const { title, description, msgId } = data;

    const embed = this.getEmbed()
      .setAuthor({
        name: this.author.user.username,
        iconURL: this.author.displayAvatarURL(),
      })
      .setColor(Colors.Red)
      .setTitle(title)
      .addFields(
        { name: 'Author:', value: `<@${this.author.user.id}>` },
        {
          name: 'Edited rule:',
          value: `Rule with id \`${msgId}\` was edited.`,
        },
        {
          name: 'New content:',
          value: description,
        },
        { name: 'Message Id:', value: `\`${msgId}\`` }
      )
      .setTimestamp(new Date());

    return embed;
  }

  @HandleErrorSecondaryAsync()
  async editRule(embed: EmbedBuilder, msgId: string) {
    if (!embed || !msgId)
      throw new Error('Embed or msgId do not exist! [sendRule (createRule)]');

    return await this.rulesController.rulesEditor(embed, msgId);
  }

  @HandleErrorSecondaryAsync()
  async sendRuleLog(embed: EmbedBuilder) {
    if (!embed)
      throw new Error('Embed does not exist! [sendRuleLog (createRule)]');

    return await this.rulesController.rulesLogCreate(embed);
  }

  @HandleErrorSecondaryAsync()
  async getModal(data: TextInputBuilder) {
    if (!data)
      throw new Error('Data was not provided! [getModal (createRule)]');

    return await this.rulesController.getModal(data);
  }
}
