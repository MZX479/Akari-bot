import { HandleError, Ready } from '@/decorators';
import { client } from '@/Main';
import { ActivityType } from 'discord.js';

@Ready()
class Event {
  constructor() {
    this.execute();
  }

  @HandleError()
  execute() {
    if (client.user) {
      console.log(`${client.user.tag} successfuly started!`.green);

      client.user.setPresence({
        status: 'dnd',
        activities: [
          {
            name: `Where is this damn makeup bag!? Version: ${process.env.npm_package_version}`,
            type: ActivityType.Playing,
          },
        ],
      });
    }
  }
}
