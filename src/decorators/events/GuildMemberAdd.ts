import { client } from '@/Main';

type settings_type = {
  once?: boolean;
};

const EVENT_NAME = 'GuildMemberAdd';

/** @description Register class as "GuildMemberAdd" event for bot */
export function GuildMemberAdd(settings?: settings_type) {
  return function <T extends { new (...args: any[]): {} }>(
    Target: T,
    context: ClassDecoratorContext
  ) {
    if (settings?.once)
      client.once(EVENT_NAME, (...args: any) => {
        new Target(...args);
      });
    else
      client.on(EVENT_NAME, (...args: any) => {
        new Target(...args);
      });
  };
}
