import { InteractionTemplate } from '@/config/templates';
import {
  HandleErrorAsync,
  HandleErrorSecondary,
  HandleErrorSecondaryAsync,
  Slash,
} from '@/decorators';

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

interface choiceObject {
  emoji: string;
  choice: string;
}

@Slash({
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('create a poll using this command')
    .addStringOption(
      new SlashCommandStringOption()
        .setName('question')
        .setDescription('Provide a question for this poll')
        .setRequired(true)
    )
    .addStringOption(
      new SlashCommandStringOption()
        .setName('choice-1')
        .setDescription('Your choice-1')
        .setRequired(true)
    )
    .addStringOption(
      new SlashCommandStringOption()
        .setName('choice-2')
        .setDescription('Your choice-2')
        .setRequired(true)
    )
    .addStringOption(
      new SlashCommandStringOption()
        .setName('choice-3')
        .setDescription('Your choice-3')
    )
    .addStringOption(
      new SlashCommandStringOption()
        .setName('choice-4')
        .setDescription('Your choice-4')
    )
    .addStringOption(
      new SlashCommandStringOption()
        .setName('choice-5')
        .setDescription('Your choice-5')
    )
    .addStringOption(
      new SlashCommandStringOption()
        .setName('choice-6')
        .setDescription('Your choice-6')
    )
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
    const question = this.get_argument('question').value as string;
    const choice_1 = this.get_argument('choice-1').value as string;
    const choice_2 = this.get_argument('choice-2').value as string;
    const choice_3 = this.get_argument('choice-3')?.value as string | undefined;
    const choice_4 = this.get_argument('choice-4')?.value as string | undefined;
    const choice_5 = this.get_argument('choice-5')?.value as string | undefined;
    const choice_6 = this.get_argument('choice-6')?.value as string | undefined;

    const previewEmbed = this.getEmbed()
      .setTitle(`${this.author.user.username} asks:`)
      .setColor(Colors.Aqua)
      .setThumbnail(this.interaction.guild!.iconURL())
      .setDescription(`**${question}**`)
      .addFields(
        { name: '1️⃣: ', value: `\`${choice_1}\`` },
        { name: '2️⃣: ', value: `\`${choice_2}\`` }
      )
      .setFooter({ text: 'THIS IS A PREVIEW!' })
      .setTimestamp(new Date());

    const choices = [] as Array<choiceObject>;

    (async () => {
      if (choice_3) {
        const choiceObject: choiceObject = {
          emoji: '3️⃣',
          choice: choice_3,
        };
        choices.push(choiceObject);
      }

      if (choice_4) {
        const choiceObject: choiceObject = {
          emoji: '4️⃣',
          choice: choice_4,
        };
        choices.push(choiceObject);
      }

      if (choice_5) {
        const choiceObject: choiceObject = {
          emoji: '5️⃣',
          choice: choice_5,
        };
        choices.push(choiceObject);
      }

      if (choice_6) {
        const choiceObject: choiceObject = {
          emoji: '6️⃣',
          choice: choice_6,
        };
        choices.push(choiceObject);
      }

      if (choices.length > 0) {
        choices.map((choice) =>
          previewEmbed.addFields({
            name: `${choice.emoji}: `,
            value: `\`${choice.choice}\``,
          })
        );
      }
    })();

    const buttons = this.getButtons();
    const preview = await this.getPreviewResult(previewEmbed, buttons);
    if (!preview) return;

    switch (preview.customId) {
      case 'send':
        const finalEmbed = this.getEmbed()
          .setTitle(`${this.author.user.username} asks:`)
          .setColor(Colors.Aqua)
          .setThumbnail(this.interaction.guild!.iconURL())
          .setDescription(`**${question}**`)
          .addFields(
            { name: '1️⃣: ', value: `\`${choice_1}\`` },
            { name: '2️⃣: ', value: `\`${choice_2}\`` }
          )
          .setTimestamp(new Date());

        if (choices.length > 0) {
          choices.map((choice) =>
            finalEmbed.addFields({
              name: `${choice.emoji}: `,
              value: `\`${choice.choice}\``,
            })
          );
        }

        const channel = this.getChannel();

        const message = await channel.send({ embeds: [finalEmbed] });

        const reactions = this.getReactions();

        (async () => {
          await this.setReaction(message, reactions[0]);
          await this.setReaction(message, reactions[1]);

          choice_3 ? await this.setReaction(message, reactions[2]) : undefined;
          choice_4 ? await this.setReaction(message, reactions[3]) : undefined;
          choice_5 ? await this.setReaction(message, reactions[4]) : undefined;
          choice_6 ? await this.setReaction(message, reactions[5]) : undefined;
        })();

        await this.replyTrue('**Poll successfully posted**', {
          components: [],
        });
        break;
      case 'cancel':
        await this.replyFalse('**Successfully canceled!**', {
          components: [],
        });
        break;

      default:
        break;
    }
  }

  @HandleErrorSecondary()
  getEmbed(): EmbedBuilder {
    return new EmbedBuilder();
  }

  @HandleErrorSecondary()
  getButtons(): Array<ButtonBuilder> {
    return [
      new ButtonBuilder()
        .setLabel('Send')
        .setStyle(ButtonStyle.Success)
        .setCustomId('send'),
      new ButtonBuilder()
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Danger)
        .setCustomId('cancel'),
    ];
  }

  @HandleErrorSecondaryAsync()
  async getPreviewResult(embed: EmbedBuilder, buttons: Array<ButtonBuilder>) {
    const preview = await this.send({
      embeds: [embed],
      components: [new ActionRowBuilder().addComponents(...buttons) as any],
    });

    return await preview
      .awaitMessageComponent({
        filter: (submit) => submit.user.id === this.author.user.id,
        time: 60000,
      })
      .catch(() => undefined);
  }

  @HandleErrorSecondary()
  getReactions(): Array<string> {
    return ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣'];
  }

  @HandleErrorSecondary()
  getChannel(): TextChannel {
    const id = process.env.POLLS_CHANNEL_ID as string;
    if (!id) throw new Error('Polls channel id does not exist!');

    const channel = this.interaction.guild!.channels.cache.get(
      id
    ) as TextChannel;
    if (!channel) throw new Error('Poll channel does not exist!');

    return channel;
  }

  @HandleErrorSecondaryAsync()
  async setReaction(message: Message, reaction: string) {
    if (!message || !reaction)
      throw new Error('Message or reaction were not provided!');

    return await message.react(reaction);
  }
}
