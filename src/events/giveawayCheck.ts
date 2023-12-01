import config from '#config';
import { DbNote } from '#types';
import { MongoClient, client } from '@/Main';
import {
  HandleError,
  HandleErrorSecondary,
  HandleErrorSecondaryAsync,
  Ready,
} from '@/decorators';
import { GiveawayController } from '@/tools';
import { Colors, EmbedBuilder, Guild, Message, TextChannel } from 'discord.js';

@Ready()
class Event extends GiveawayController {
  constructor() {
    const guild = client.guilds.cache.get(config.guild_id) as Guild;
    super(guild);
    this.execute();
  }

  @HandleError()
  execute() {
    setInterval(this._checkGiveaway.bind(this), 30000);
    console.log('Check giveaway interval successfuly setted up'.green);
  }

  @HandleErrorSecondaryAsync()
  async _checkGiveaway() {
    const giveawaysCollection = MongoClient.db(
      config.guild_id
    ).collection<DbNote>('Giveaways');

    const giveaways = await giveawaysCollection
      .find({
        giveawayTime: {
          $lt: new Date().getTime(),
        },
      })
      .toArray();

    const giveawayChannel = this.getGiveawayChannel();
    const giveawayEmbed = this.getEmbed();
    const logEmbed = this.getEmbed();

    for (let giveaway of giveaways) {
      if (giveaway.content.giveawayStatus === 'done') continue;
      const { msgId, content } = giveaway;

      const message = await this.fetchAndReturnMessage(giveawayChannel, msgId!);

      const participants = giveaway.content.giveawayParticipants;
      if (!participants || !participants[0]) {
        giveawayEmbed
          .setTitle('Giveaway failed!')
          .setColor(Colors.Red)
          .addFields(
            {
              name: 'Sponsor',
              value: `<@${content.sponsor}>`,
            },
            {
              name: 'Time',
              value: 'Done',
            },
            {
              name: 'Card',
              value: `\`${content.card}\``,
            },
            {
              name: 'Description',
              value: `>>> **Giveaway failed.**\n **Reason: No one participated**`,
            }
          )
          .setFooter({ text: ':c' })
          .setTimestamp(new Date());
        await this.editMessage(message, giveawayEmbed, []);
        await this.updateDbNote({
          msgId,
          content: {
            description: 'Giveaway failed, no one participated!',
            card: content.card,
            giveawayStatus: 'done',
            sponsor: content.sponsor,
          },
        });
        logEmbed
          .setTitle('Giveaway failed!')
          .setColor(Colors.Red)
          .setDescription(
            `>>> **Giveaway with id \`${msgId}\` failed because no one participated!**`
          )
          .setTimestamp(new Date());
        await this.sendGiveawayLog(logEmbed);

        continue;
      }

      const findWinner =
        participants[Math.floor(Math.random() * participants.length)];
      giveawayEmbed
        .setTitle('Giveaway ended!')
        .setColor(Colors.Green)
        .addFields(
          {
            name: 'Sponsor',
            value: `<@${content.sponsor}>`,
          },
          {
            name: 'Time',
            value: `\`Done\``,
          },
          {
            name: 'Card',
            value: `\`${content.card}\``,
          },
          {
            name: 'Description',
            value: `>>> **Giveaway ended.**\n **Winner: <@${findWinner}>**`,
          }
        )
        .setFooter({ text: 'Congratulations!' })
        .setTimestamp(new Date());

      await this.editMessage(message, giveawayEmbed, []);
      await giveawayChannel.send(
        `**Congratulations <@${findWinner}>, you won \`${content.card}\`!**`
      );
      await this.updateDbNote({
        msgId,
        content: {
          giveawayStatus: 'done',
          card: content.card,
          winner: findWinner,
          sponsor: content.sponsor,
          description: `Giveaway done. Winner: ${findWinner}`,
        },
      });

      logEmbed
        .setTitle('Giveaway ended!')
        .setColor(Colors.Green)
        .addFields(
          {
            name: 'Sponsor',
            value: `<@${content.sponsor}>`,
          },
          {
            name: 'Time',
            value: 'Done',
          },
          {
            name: 'Card',
            value: `\`${content.card}\``,
          },
          {
            name: 'Description',
            value: `**Giveaway ended.**\n **Winner: <@${findWinner}>**`,
          },
          {
            name: 'Msg Id',
            value: `\`${msgId}\``,
          }
        )
        .setFooter({ text: 'Congratulations!' })
        .setTimestamp(new Date());

      await this.sendGiveawayLog(logEmbed);
    }
  }

  @HandleErrorSecondaryAsync()
  async sendGiveawayLog(embed: EmbedBuilder) {
    if (!embed) throw new Error('Data was not provided!');

    return await this.giveawayLogCreate(embed);
  }

  @HandleErrorSecondary()
  giveawayChannel(): TextChannel {
    return this.getGiveawayChannel();
  }

  @HandleErrorSecondary()
  getEmbed(): EmbedBuilder {
    return this.getGiveawayEmbed();
  }

  @HandleErrorSecondaryAsync()
  async updateDbNote(data: DbNote) {
    if (!data) throw new Error('Data was not provided!');

    return await this.updateGiveawayDbNote(data);
  }

  @HandleErrorSecondaryAsync()
  async fetchAndReturnMessage(channel: TextChannel, messageId: string) {
    return await channel.messages.fetch(messageId);
  }

  @HandleErrorSecondaryAsync()
  async editMessage(message: Message, embed: EmbedBuilder, components: []) {
    if (!message || !embed || !components)
      throw new Error('One or more arguments were not provided!');

    return await message.edit({ embeds: [embed], components });
  }
}
