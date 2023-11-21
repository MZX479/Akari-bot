import config from '#config';
import { DbNote } from '#types';
import { MongoClient, client } from '@/Main';
import {
  HandleError,
  HandleErrorSecondary,
  HandleErrorSecondaryAsync,
  Ready,
} from '@/decorators';
import { Colors, EmbedBuilder, Guild, TextChannel } from 'discord.js';

@Ready()
class Event {
  constructor() {
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

    const guild = client.guilds.cache.get(config.guild_id);
    if (!guild)
      throw new Error('Guild not found! [_checkGiveaway (giveawayCheck)]');

    const giveawayChannel = await this.getGiveawayChannel(guild);
    const giveawayLogChannel = await this.getGiveawayLogChannel(guild);
    const embed = this.getEmbed();
    const logEmbed = this.getEmbed();

    for (let giveaway of giveaways) {
      if (giveaway.content.giveawayStatus === 'done') continue;
      const { msgId, content } = giveaway;

      const message = await this.fetchAndReturnMessage(giveawayChannel, msgId!);

      const participants = giveaway.content.giveawayParticipants;
      if (!participants || !participants[0]) {
        await message.edit({
          embeds: [
            embed
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
              .setTimestamp(new Date()),
          ],
          components: [],
        });

        await giveawaysCollection.updateOne(
          {
            msgId,
          },
          {
            $set: {
              content: {
                giveawayStatus: 'done',
                description: 'Giveaway failed.',
              },
            },
          }
        );

        await giveawayLogChannel.send({
          embeds: [
            logEmbed
              .setTitle('Giveaway failed!')
              .setColor(Colors.Red)
              .setDescription(
                `>>> **Giveaway with id \`${msgId}\` failed because no one participated!**`
              )
              .setTimestamp(new Date()),
          ],
        });

        giveawayChannel.send;

        continue;
      }

      const findWinner =
        participants[Math.floor(Math.random() * participants.length)];

      await message.edit({
        embeds: [
          embed
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
            .setTimestamp(new Date()),
        ],
        components: [],
      });

      await giveawayChannel.send(
        `Congratulations <@${findWinner}>, you won the \`${content.card}\``
      );

      await giveawaysCollection.updateOne(
        {
          msgId,
        },
        {
          $set: {
            content: {
              giveawayStatus: 'done',
              card: content.card,
              winner: findWinner,
              sponsor: content.sponsor,
              description: `Giveaway done. Winner: ${findWinner}`,
            },
          },
        }
      );

      await giveawayLogChannel.send({
        embeds: [
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
            .setTimestamp(new Date()),
        ],
      });
    }
  }

  @HandleErrorSecondaryAsync()
  async getGiveawayChannel(guild: Guild): Promise<TextChannel> {
    const giveawayChannelId = process.env.GIVEAWAY_CHANNEL_ID;

    if (!giveawayChannelId)
      throw new Error(
        'GIVEAWAY_CHANNEL_ID does not exist, [getGiveawayChannel (giveawayCheck)]'
      );

    const giveawayChannel = guild.channels.cache.get(
      giveawayChannelId
    ) as TextChannel;

    if (!giveawayChannel)
      throw new Error(
        'giveawayChannel does not exist! [getGiveawayChannel (giveawayCheck)]'
      );

    return giveawayChannel;
  }

  @HandleErrorSecondary()
  getEmbed(): EmbedBuilder {
    return new EmbedBuilder();
  }

  @HandleErrorSecondaryAsync()
  async fetchAndReturnMessage(channel: TextChannel, messageId: string) {
    return await channel.messages.fetch(messageId);
  }

  @HandleErrorSecondaryAsync()
  async getGiveawayLogChannel(guild: Guild): Promise<TextChannel> {
    const giveawayLogChannelId = process.env.GIVEAWAY_LOGS_CHANNEL_ID;

    if (!giveawayLogChannelId)
      throw new Error(
        'GIVEAWAY_CHANNEL_ID does not exist, [getGiveawayChannel (giveawayCheck)]'
      );

    const giveawayLogChannel = guild.channels.cache.get(
      giveawayLogChannelId
    ) as TextChannel;

    if (!giveawayLogChannel)
      throw new Error(
        'giveawayChannel does not exist! [getGiveawayChannel (giveawayCheck)]'
      );

    return giveawayLogChannel;
  }
}
