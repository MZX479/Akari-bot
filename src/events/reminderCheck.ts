import config from '#config';
import { remindDbType } from '#types';
import { MongoClient, client } from '@/Main';
import {
  HandleError,
  HandleErrorSecondary,
  HandleErrorSecondaryAsync,
  Ready,
} from '@/decorators';
import { GiveawayController } from '@/tools';
import { remindersController } from '@/tools/remController';
import {
  Colors,
  EmbedBuilder,
  Guild,
  GuildMember,
  TextChannel,
} from 'discord.js';

@Ready()
class Event extends remindersController {
  constructor() {
    const guild = client.guilds.cache.get(config.guild_id) as Guild;
    super(guild);
    this.execute();
  }

  @HandleError()
  execute() {
    setInterval(this._checkReminders.bind(this), 30000);
    console.log('Check giveaway interval successfuly setted up'.green);
  }

  @HandleErrorSecondaryAsync()
  async _checkReminders() {
    const reminders = await this.getDbNotes();

    const replyEmbed = this.getEmptyEmbed()
      .setTitle('Reminder!')
      .setColor(Colors.Red)
      .setFooter({ text: "Don't forget!" })
      .setTimestamp(new Date());

    for (let reminder of reminders) {
      if (reminder.status === 'done') continue;

      await this.updateDbNote(reminder.id, 'done');

      replyEmbed.setDescription(`**${reminder.content}**`);

      const member = await this.getMember(reminder.authorId);
      if (!member) continue;

      await this.sendRem(member, replyEmbed);
    }
  }

  @HandleErrorSecondary()
  getEmptyEmbed(): EmbedBuilder {
    return this.getEmbed();
  }

  @HandleErrorSecondaryAsync()
  async sendRem(member: GuildMember, embed: EmbedBuilder) {
    if (!member || !embed) throw new Error('Member or embed were not provided');

    return await this.sendReminder(member, embed);
  }

  @HandleErrorSecondaryAsync()
  async getDbNotes(): Promise<remindDbType[]> {
    const remindersCollection = MongoClient.db(
      config.guild_id
    ).collection<remindDbType>('Reminders');

    const reminders = await remindersCollection
      .find({
        timer: {
          $lt: new Date().getTime(),
        },
      })
      .toArray();

    return reminders;
  }

  @HandleErrorSecondaryAsync()
  async updateDbNote(id: string, status: remindDbType['status']) {
    if (!id || !status) throw new Error('Id or status were not provided!');

    return await this.updateReminderDbNote(id, status);
  }
}
