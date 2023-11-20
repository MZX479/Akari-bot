import { DbNote, giveawayLogType, giveawayType } from '#types';
import { InteractionTemplate } from '@/config/templates';
import {
  HandleErrorAsync,
  HandleErrorSecondary,
  HandleErrorSecondaryAsync,
  Slash,
} from '@/decorators';
import { GiveawayController } from '@/tools/GiveawayController';
import parse from 'parse-duration';

import {
  ButtonBuilder,
  Colors,
  CommandInteraction,
  EmbedBuilder,
  GuildMember,
  SlashCommandBuilder,
  SlashCommandMentionableOption,
  SlashCommandStringOption,
  time,
} from 'discord.js';

@Slash({
  data: new SlashCommandBuilder()
    .setName('create-giveaway')
    .setDescription('create a giveaway using this command')
    .addStringOption(
      new SlashCommandStringOption()
        .setName('card')
        .setDescription('provide a card code.')
        .setRequired(true)
    )
    .addMentionableOption(
      new SlashCommandMentionableOption()
        .setName('sponsor')
        .setDescription('provide a sponsor')
        .setRequired(true)
    )
    .addStringOption(
      new SlashCommandStringOption()
        .setName('time')
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
  giveawaysController: GiveawayController;

  constructor(interaction: CommandInteraction) {
    super(interaction);
    this.interaction = interaction;
    this.author = interaction.member as GuildMember;
    this.giveawaysController = new GiveawayController(
      interaction,
      interaction.guild!
    );
    this.execute();
  }

  @HandleErrorAsync()
  private async execute() {
    const card = this.get_argument('card').value as string;
    const sponsor = this.get_argument('sponsor').member as GuildMember;
    const timer = this.get_argument('time').value as string;

    const parsedTime = parse(timer);
    if (!parsedTime) return;
    const newTime = new Date().getTime() + parsedTime;
    const description = `>>> **Giveaway started!**\n**Click the button below to participate!**`;

    const button = this.getButton();
    const giveawayEmbed = await this.createGiveawayEmbed({
      sponsor,
      card,
      timer: newTime,
      description,
    });

    const sendGiveaway = await this.sendGiveaway(giveawayEmbed, button);

    const giveawayLog = await this.logCreate({
      card,
      description,
      sponsor,
      timer: newTime,
      msgId: sendGiveaway.id,
    });

    await this.logSend(giveawayLog);
    await this.createDbNote({
      author: this.author.user.id,
      giveawayTime: newTime,
      msgId: sendGiveaway.id,
      content: {
        sponsor: sponsor.user.id,
        description,
        card,
        giveawayStatus: 'active',
        giveawayParticipants: [],
      },
    });

    return await this.replyTrue('**Giveaway successfully created!**');
  }

  @HandleErrorSecondary()
  getEmbed(): EmbedBuilder {
    return this.giveawaysController.getGiveawayEmbed();
  }

  @HandleErrorSecondary()
  getButton(): ButtonBuilder {
    return this.giveawaysController.getButton();
  }

  @HandleErrorSecondaryAsync()
  async createGiveawayEmbed(data: giveawayType): Promise<EmbedBuilder> {
    const { sponsor, timer, card, description } = data;

    const embed = this.getEmbed()
      .setAuthor({
        name: this.author.user.username,
        iconURL: this.author.displayAvatarURL(),
      })
      .setColor(Colors.Purple)
      .setTitle('Giveaway started!')
      .setThumbnail(sponsor.avatarURL() || this.interaction.guild!.iconURL())
      .addFields(
        { name: 'Sponsor', value: `<@${sponsor.user.id}>` },
        { name: 'Time', value: `${time(new Date(timer), 'R')}` },
        { name: 'Card', value: `\`${card}\`` },
        { name: 'Description', value: description }
      )
      .setFooter({ text: '↓ Click ↓' })
      .setTimestamp(new Date());

    return embed;
  }

  @HandleErrorSecondaryAsync()
  async sendGiveaway(embed: EmbedBuilder, button: ButtonBuilder) {
    if (!embed || !button)
      throw new Error(
        'Embed or button does not exist! [sendGiveaway (createGiveaway)]'
      );

    return await this.giveawaysController.giveawayCreate(embed, button);
  }

  @HandleErrorSecondaryAsync()
  async logCreate(data: giveawayLogType): Promise<EmbedBuilder> {
    if (!data) throw new Error('Data was not provided!');

    const { sponsor, timer, card, description, msgId } = data;

    const embed = this.getEmbed()
      .setAuthor({
        name: this.author.user.username,
        iconURL: this.author.displayAvatarURL(),
      })
      .setColor(Colors.Purple)
      .setTitle('Giveaway started!')
      .setThumbnail(sponsor.avatarURL() || this.interaction.guild!.iconURL())
      .addFields(
        { name: 'Creator', value: `<@${this.author.user.id}>` },
        { name: 'Sponsor', value: `<@${sponsor.user.id}>` },
        { name: 'Time', value: `${time(new Date(timer), 'R')}` },
        { name: 'Card', value: `\`${card}\`` },
        { name: 'Description', value: description },
        { name: 'Msg Id', value: `\`${msgId}\`` }
      )
      .setFooter({ text: 'Crteated at ' })
      .setTimestamp(new Date());

    return embed;
  }

  @HandleErrorSecondaryAsync()
  async logSend(embed: EmbedBuilder) {
    if (!embed)
      throw new Error('Embed does not exist! [logSend (createGiveaway)]');

    return await this.giveawaysController.giveawayLogCreate(embed);
  }

  @HandleErrorSecondaryAsync()
  async createDbNote(data: DbNote) {
    if (!data)
      throw new Error('Data was not provided! [createDbNote (createGiveaway)]');

    return await this.giveawaysController.createGiveawayDbNote(data);
  }
}
