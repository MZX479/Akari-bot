import { DbNote, bountyLogType, bountyType } from '#types';
import { InteractionTemplate } from '@/config/templates';
import {
  HandleErrorAsync,
  HandleErrorSecondary,
  HandleErrorSecondaryAsync,
  Slash,
} from '@/decorators';
import { BountyController } from '@/tools';

import {
  Colors,
  CommandInteraction,
  EmbedBuilder,
  GuildMember,
  ModalBuilder,
  SlashCommandBuilder,
  SlashCommandStringOption,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';

@Slash({
  data: new SlashCommandBuilder()
    .setName('create-bounty')
    .setDescription('Create a bounty using this command.')
    .addStringOption(
      new SlashCommandStringOption()
        .setName('reward')
        .setDescription('reward for this card.')
        .setRequired(true)
    )
    .addStringOption(
      new SlashCommandStringOption()
        .setName('target')
        .setDescription('Specify description of the character/card you want.')
        .setMaxLength(50)
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
    const reward = this.get_argument('reward').value as string;
    const target = this.get_argument('target').value as string;

    const inputField = new TextInputBuilder()
      .setLabel('Describe character/card you want.')
      .setCustomId('description')
      .setMinLength(10)
      .setMaxLength(300)
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

    const bountyEmbed = await this.createBountyEmbed({
      description,
      reward,
      target,
    });

    if (!bountyEmbed)
      return await this.replyFalseH('Bounty embed does not exist!');

    const bountyEmbedSender = await this.sendBounty(bountyEmbed);

    const logEmbed = this.createLog({
      description,
      reward,
      target,
      status: 'active',
      msgId: bountyEmbedSender.id,
    });

    if (!logEmbed) return await this.replyFalseH('Log embed does not exist!');

    await this.sendLogs(logEmbed);
    await this.createDbNote({
      author: this.author.user.id,
      msgId: bountyEmbedSender.id,
      content: {
        description,
        bountyReward: reward,
        bounty: target,
        bountyStatus: 'active',
      },
    });

    await modalSubmit.reply({ content: '`Successfully added!`' });

    description = '';

    setTimeout(() => modalSubmit.deleteReply(), 5000);
  }

  @HandleErrorSecondary()
  getEmbed(): EmbedBuilder {
    return this.bountyController.getBountyEmbed();
  }

  @HandleErrorSecondary()
  createBountyEmbed(data: bountyType): EmbedBuilder {
    if (!data)
      throw new Error(
        'Data was not provided! [createBountyEmbed (createBounty)]'
      );

    const { target, reward, description } = data;

    return this.getEmbed()
      .setColor(Colors.Yellow)
      .setAuthor({
        name: this.author.user.username,
        iconURL: this.author.user.displayAvatarURL(),
      })
      .setTitle('Bounty posted:')
      .setThumbnail(
        'https://cdn.discordapp.com/attachments/1163811631357235241/1163813528663228500/Screenshot_151.png?ex=655365cf&is=6540f0cf&hm=db43aab39411f692ba7309f44b8e298e36a3acd28282415b29bdc7ecb199cbd6&'
      )
      .addFields(
        {
          name: 'Author:',
          value: `<@${this.author.user.id}>`,
        },
        {
          name: 'Target:',
          value: `\`${target}\``,
        },
        {
          name: 'Reward:',
          value: `\`${reward}\``,
        },
        {
          name: 'Status:',
          value: `\`active\``,
        },
        {
          name: 'Description:',
          value: `\`${description}\``,
        }
      )
      .setTimestamp(new Date());
  }

  @HandleErrorSecondaryAsync()
  async sendBounty(embed: EmbedBuilder) {
    if (!embed)
      throw new Error('Embed was not provided! [sendBounty (createBounty)]');

    return await this.bountyController.bountySender(embed);
  }

  @HandleErrorSecondary()
  createLog(data: bountyLogType): EmbedBuilder {
    if (!data)
      throw new Error('Data was not provided! [createLog (createBounty)]');

    const { target, reward, msgId, description, status } = data;

    return this.getEmbed()
      .setAuthor({
        name: this.author.user.username,
        iconURL: this.author.displayAvatarURL(),
      })
      .setTitle('Bounty posted:')
      .setColor(Colors.White)
      .setThumbnail(
        'https://cdn.discordapp.com/attachments/1163811631357235241/1163813528663228500/Screenshot_151.png?ex=655365cf&is=6540f0cf&hm=db43aab39411f692ba7309f44b8e298e36a3acd28282415b29bdc7ecb199cbd6&'
      )
      .addFields(
        {
          name: 'Author:',
          value: `<@${this.author.user.id}>`,
        },
        {
          name: 'Target:',
          value: `\`${target}\``,
        },
        {
          name: 'Reward:',
          value: `\`${reward}\``,
        },
        {
          name: 'Status:',
          value: `\`${status}\``,
        },
        {
          name: 'Description:',
          value: `\`${description}\``,
        },
        {
          name: 'Message Id:',
          value: `\`${msgId}\``,
        }
      )
      .setTimestamp(new Date());
  }

  @HandleErrorSecondaryAsync()
  async sendLogs(embed: EmbedBuilder) {
    if (!embed)
      throw new Error('Embed was not provided! [sendLogs (createBounty)]');

    return await this.bountyController.bountyLogCreate(embed);
  }

  @HandleErrorSecondaryAsync()
  async createDbNote(data: DbNote) {
    if (!data)
      throw new Error('Data was not provided! [createDbNote (createBounty)]');

    return await this.bountyController.createBountyDbNote(data);
  }

  @HandleErrorSecondaryAsync()
  async getModal(data: TextInputBuilder): Promise<ModalBuilder> {
    if (!data)
      throw new Error('Data was not provided! [getModal (createBounty)]');

    return await this.bountyController.getModal(data);
  }
}
