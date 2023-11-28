import { DbNote, bountyLogType } from '#types';
import { InteractionTemplate } from '@/config/templates';
import {
  HandleErrorAsync,
  HandleErrorSecondary,
  HandleErrorSecondaryAsync,
  Slash,
} from '@/decorators';
import { BountyController } from '@/tools';

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  CommandInteraction,
  EmbedBuilder,
  GuildMember,
  Message,
  SlashCommandBuilder,
  SlashCommandStringOption,
  TextChannel,
} from 'discord.js';

@Slash({
  data: new SlashCommandBuilder()
    .setName('edit-bounty-status')
    .setDescription('edit a bounty using this command.')
    .addStringOption(
      new SlashCommandStringOption()
        .setName('message-id')
        .setDescription('provide a message id of bounty')
        .setRequired(true)
    )
    .toJSON(),
  type: 'Utility',
})
class Command extends InteractionTemplate {
  interaction: CommandInteraction;
  bountyController: BountyController;
  author: GuildMember;
  constructor(interaction: CommandInteraction) {
    super(interaction);
    this.interaction = interaction;
    this.bountyController = new BountyController(
      interaction,
      interaction.guild!
    );
    this.author = interaction.member as GuildMember;
    this.execute();
  }

  @HandleErrorAsync()
  private async execute() {
    const messageId = this.get_argument('message-id').value as string;

    const bountyDb = await this.getBountyDbNote(messageId);
    if (!bountyDb)
      return await this.replyFalseH('Bounty in database does not exist!');

    const { author, content } = bountyDb;
    const { bountyStatus, bounty, bountyReward, description } = content;
    if (author !== this.author.user.id)
      return await this.replyFalseH('You are not the author of this bounty!');

    const message = await this.getMessage(messageId);
    if (!message) return await this.replyFalseH('Bounty does not exist!');

    const launchEmbed = this.getEmbed()
      .setColor(Colors.Yellow)
      .setAuthor({
        name: this.author.user.username,
        iconURL: this.author.displayAvatarURL(),
      })
      .setDescription('**What do you want to do with this bounty?**')
      .setTimestamp(new Date());

    const panel = await this.getActionRow(launchEmbed);
    if (!panel) return;

    const finalEmbed = this.getEmbed();
    let finalReply: Message<boolean>;
    const deleteReply = async (msg: Message<boolean>) => {
      setTimeout(async () => await msg.delete(), 5000);
    };

    switch (panel.customId) {
      case 'close':
        finalEmbed
          .setAuthor({
            name: this.author.user.username,
            iconURL: this.author.displayAvatarURL(),
          })
          .setTitle('Bounty closed (Failed)')
          .setColor(Colors.Red)
          .addFields(
            { name: 'Author:', value: `<@${this.author.user.id}>` },
            { name: 'Target:', value: `\`${bounty}\`` },
            { name: 'Reward:', value: `\`${bountyReward}\`` },
            { name: 'Status:', value: `\`${bountyStatus}\`` },
            { name: 'Description:', value: description }
          )
          .setTimestamp(new Date());

        await message.edit({ embeds: [finalEmbed] });
        await this.editBountyDbNote({
          msgId: messageId,
          content: {
            description,
            bounty,
            bountyReward,
            bountyStatus: 'canceled',
          },
        });

        const closeLog = this.createLogBounty({
          target: bounty!,
          description,
          msgId: messageId,
          reward: bountyReward!,
          status: 'done',
        });
        await this.sendLogBounty(closeLog);

        finalReply = await this.replyTrue(
          '**Your bounty was successfully closed!**',
          { components: [] }
        );
        await deleteReply(finalReply);
        break;

      case 'delete':
        await message.delete();
        await this.editBountyDbNote({
          msgId: messageId,
          content: {
            description,
            bounty,
            bountyReward,
            bountyStatus: 'deleted',
          },
        });
        const deleteLog = this.createLogBounty({
          target: bounty!,
          description,
          msgId: messageId,
          reward: bountyReward!,
          status: 'done',
        });
        await this.sendLogBounty(deleteLog);
        finalReply = await this.replyTrue(
          '**You successfully deleted you bounty!**',
          { components: [] }
        );
        await deleteReply(finalReply);
        break;

      case 'finalise':
        finalEmbed
          .setAuthor({
            name: this.author.user.username,
            iconURL: this.author.displayAvatarURL(),
          })
          .setColor(Colors.Green)
          .setTitle('Bounty closed (Successful)')
          .addFields(
            { name: 'Author:', value: `<@${this.author.user.id}>` },
            { name: 'Target:', value: `\`${bounty}\`` },
            { name: 'Reward:', value: `\`${bountyReward}\`` },
            { name: 'Status:', value: `\`${bountyStatus}\`` },
            { name: 'Description:', value: description }
          )
          .setTimestamp(new Date());

        await message.edit({ embeds: [finalEmbed] });
        await this.editBountyDbNote({
          msgId: messageId,
          content: {
            description,
            bounty,
            bountyReward,
            bountyStatus: 'done',
          },
        });

        const successLog = this.createLogBounty({
          target: bounty!,
          description,
          msgId: messageId,
          reward: bountyReward!,
          status: 'done',
        });
        await this.sendLogBounty(successLog);

        finalReply = await this.replyTrue('**Bounty successfully updated!**', {
          components: [],
        });
        await deleteReply(finalReply);
        break;

      case 'cancel':
        finalReply = await this.replyFalse(
          '>>> **You canceled the command!**',
          { components: [] }
        );
        await deleteReply(finalReply);
        break;

      default:
        break;
    }
  }

  @HandleErrorSecondary()
  getButtons(): Array<ButtonBuilder> {
    const buttons = [
      new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setLabel('Close')
        .setCustomId('close'),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setLabel('Delete')
        .setCustomId('delete'),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setLabel('Finalise')
        .setCustomId('finalise'),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setLabel('Cancel')
        .setCustomId('cancel'),
    ];

    return buttons;
  }

  @HandleErrorSecondary()
  getEmbed(): EmbedBuilder {
    return this.bountyController.getBountyEmbed();
  }

  @HandleErrorSecondary()
  getChannel(): TextChannel {
    return this.bountyController.getBountyChannel();
  }

  @HandleErrorSecondaryAsync()
  async getMessage(msgId: string): Promise<Message> {
    if (!msgId) throw new Error('MsgId does not exist!');

    const channel = this.getChannel();
    if (!channel) throw new Error('Channel does not exist!');

    const message = await channel.messages.fetch(msgId);
    if (!message)
      return await this.replyFalseH(
        '>>> **Message does not exist, check id.**'
      );

    return message;
  }

  @HandleErrorSecondaryAsync()
  async getActionRow(embed: EmbedBuilder) {
    if (!embed) throw new Error('Embed were not provided!');

    const buttons = this.getButtons();
    if (!buttons) throw new Error('Buttons do not exist!');

    const ask_answer = await this.send({
      embeds: [embed],
      components: [new ActionRowBuilder().addComponents(...buttons) as any],
    });

    return await ask_answer
      .awaitMessageComponent({
        filter: (inter) => inter.user.id === this.interaction.user.id,
        time: 60000,
      })
      .catch(() => undefined);
  }

  @HandleErrorSecondaryAsync()
  async getBountyDbNote(msgId: string) {
    if (!msgId) throw new Error('AuthorId was not provided!');

    return await this.bountyController.getBountyDbNote(msgId);
  }

  @HandleErrorSecondaryAsync()
  async editBounty(embed: EmbedBuilder, msgId: string) {
    if (embed) throw new Error('Embed was not provided!');

    return await this.bountyController.bountyEditor(embed, msgId);
  }

  @HandleErrorSecondaryAsync()
  async editBountyDbNote(content: DbNote) {
    if (!content) throw new Error('Content was not provided!');

    if (!content.msgId) throw new Error('MsgId was not provided!');

    return await this.bountyController.updateDbNoteByMsgId(
      content.msgId,
      content.content
    );
  }

  @HandleErrorSecondary()
  createLogBounty(data: bountyLogType): EmbedBuilder {
    if (!data) throw new Error('Data was not provided!');

    const { target, reward, description, msgId, status } = data;

    return this.getEmbed()
      .setAuthor({
        name: this.author.user.username,
        iconURL: this.author.displayAvatarURL(),
      })
      .setColor(Colors.Green)
      .setTitle('Bounty status updated')
      .addFields(
        { name: 'Author:', value: `<@${this.author.user.id}>` },
        { name: 'Target:', value: `\`${target}\`` },
        { name: 'Reward:', value: `\`${reward}\`` },
        { name: 'Status:', value: `\`${status}\`` },
        { name: 'Description:', value: description },
        { name: 'MsgId:', value: msgId }
      )
      .setTimestamp(new Date());
  }

  @HandleErrorSecondaryAsync()
  async sendLogBounty(embed: EmbedBuilder) {
    if (!embed) throw new Error('LogEmbed was not provided!');

    return await this.bountyController.bountyLogCreate(embed);
  }
}
