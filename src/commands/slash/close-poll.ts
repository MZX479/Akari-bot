import { InteractionTemplate } from '@/config/templates';
import {
  HandleErrorAsync,
  HandleErrorSecondary,
  HandleErrorSecondaryAsync,
  Slash,
} from '@/decorators';

import {
  ColorResolvable,
  CommandInteraction,
  Embed,
  EmbedBuilder,
  Message,
  SlashCommandBuilder,
  SlashCommandStringOption,
  TextChannel,
} from 'discord.js';

@Slash({
  data: new SlashCommandBuilder()
    .setName('close-poll')
    .setDescription('close poll using this command.')
    .addStringOption(
      new SlashCommandStringOption()
        .setName('message-id')
        .setDescription('put an id of poll message')
        .setRequired(true)
    )
    .addStringOption(
      new SlashCommandStringOption()
        .setName('the-chosen-option')
        .setDescription('provide a chosen option')
        .setRequired(true)
    )
    .toJSON(),
  type: 'Utility',
})
class Command extends InteractionTemplate {
  interaction: CommandInteraction;

  constructor(interaction: CommandInteraction) {
    super(interaction);
    this.interaction = interaction;
    this.execute();
  }

  @HandleErrorAsync()
  private async execute() {
    const messageId = this.get_argument('message-id').value as string;
    const choice = this.get_argument('the-chosen-option').value as string;
    let fetchedEmbed;

    const message = await this.fetchMessage(messageId);

    const messageEmbeds = this.getEmbeds(message);
    fetchedEmbed = messageEmbeds[0].data;

    const updatedEmbed = this.getEmbed()
      .setColor(fetchedEmbed.color as ColorResolvable)
      .setTitle(fetchedEmbed.title!)
      .setThumbnail(fetchedEmbed.thumbnail!.url)
      .setFooter({ text: 'Updated at ' })
      .setTimestamp(new Date());

    fetchedEmbed.fields!.map((field) =>
      updatedEmbed.addFields({ name: field.name, value: field.value })
    );

    updatedEmbed.addFields({
      name: '**Most voted:**',
      value: `\`${choice}\``,
    });

    await this.editEmbed(message, updatedEmbed);

    await this.removeReactions(message);

    const finalReply = await this.replyTrue(
      '**Poll was successfully closed!**'
    );

    setTimeout(() => finalReply.delete(), 5000);
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
  async fetchMessage(messageId: string) {
    if (!messageId) throw new Error('Message id was not provided!');

    const channel = this.getChannel();
    if (!channel) throw new Error('Channel does not exist!');

    const message = await channel.messages.fetch(messageId);
    if (!message) throw new Error('Message does not exist!');

    return message;
  }

  @HandleErrorSecondaryAsync()
  async editEmbed(message: Message, embed: EmbedBuilder) {
    if (!message || !embed)
      throw new Error('Message or embed were not provided!');

    return await message.edit({ embeds: [embed] });
  }

  @HandleErrorSecondary()
  getEmbed(): EmbedBuilder {
    return new EmbedBuilder();
  }

  @HandleErrorSecondary()
  getEmbeds(message: Message): Embed[] {
    if (!message) throw new Error('Message was not provided!');

    return message.embeds;
  }

  @HandleErrorSecondaryAsync()
  async removeReactions(message: Message) {
    if (!message) throw new Error('Message was not provided!');

    return await message.reactions.removeAll();
  }
}
