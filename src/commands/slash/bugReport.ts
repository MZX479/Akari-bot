import { InteractionTemplate } from '@/config/templates';
import {
  HandleErrorAsync,
  HandleErrorSecondary,
  HandleErrorSecondaryAsync,
  Slash,
} from '@/decorators';

import {
  ActionRowBuilder,
  Colors,
  CommandInteraction,
  EmbedBuilder,
  GuildMember,
  ModalBuilder,
  SlashCommandBuilder,
  TextChannel,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';

@Slash({
  data: new SlashCommandBuilder()
    .setName('bug-report')
    .setDescription('Found a bug? Report!')
    .toJSON(),
  type: 'Utility',
})
class Command extends InteractionTemplate {
  interaction: CommandInteraction;
  author: GuildMember;
  constructor(interaction: CommandInteraction) {
    super(interaction);
    this.interaction = interaction;
    this.author = interaction.member as GuildMember;
    this.execute();
  }

  @HandleErrorAsync()
  private async execute() {
    const inputField = new TextInputBuilder()
      .setLabel('Describe a bug you found')
      .setCustomId('description')
      .setMinLength(10)
      .setMaxLength(300)
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const modalWindow = this.modalCreate(inputField);
    if (!modalWindow)
      return await this.replyFalseH('Modal window does not exist!');

    await this.interaction.showModal(modalWindow);

    const modalSubmit = await this.interaction.awaitModalSubmit({
      filter: (submit) => submit.user.id === this.interaction.user.id,
      time: 600000,
    });

    let description = modalSubmit.fields.fields.get('description')?.value;

    const bugEmbed = this.getEmbed()
      .setTitle('Bug report:')
      .setColor(Colors.Red)
      .setThumbnail(this.author.displayAvatarURL())
      .addFields(
        {
          name: '🔰 User',
          value: `<@${this.author.user.id}>, ID - \`${this.author.user.id}\``,
        },
        { name: '❗️ Reported', value: `\`${description}\`` }
      )
      .setFooter({ text: "Pasha, don't forget!" })
      .setTimestamp(new Date());

    await this.sendBug(bugEmbed);

    const reply = await modalSubmit.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Green)
          .setDescription('>>> **Successfully sent, thank you!**')
          .setTimestamp(new Date()),
      ],
    });

    description = '';

    setTimeout(async () => await reply.delete(), 5000);
  }

  @HandleErrorSecondary()
  getEmbed(): EmbedBuilder {
    return new EmbedBuilder();
  }

  @HandleErrorSecondary()
  getBugsChannel() {
    const channelId = process.env.BUGS_CHANNEL_ID;
    if (!channelId) throw new Error('ChannelId does not exist!');

    const channel = this.interaction.guild!.channels.cache.get(
      channelId
    ) as TextChannel;
    if (!channel) throw new Error('Channel does not exist!');

    return channel;
  }

  @HandleErrorSecondary()
  modalCreate(data: TextInputBuilder): ModalBuilder {
    if (!data) throw new Error('Data was not provided!');

    const modal = new ModalBuilder()
      .setCustomId('descriptionModal')
      .setTitle('Describe if it needs to.');

    const inputField = data;

    const row = new ActionRowBuilder<TextInputBuilder>().addComponents(
      inputField
    );

    modal.addComponents(row);

    return modal;
  }

  @HandleErrorSecondaryAsync()
  async sendBug(embed: EmbedBuilder) {
    if (!embed) throw new Error('Embed was not provided!');

    const channel = this.getBugsChannel();
    if (!channel)
      throw new Error('Something went wrong, channel does not exist');

    return await channel.send({ embeds: [embed] });
  }
}
