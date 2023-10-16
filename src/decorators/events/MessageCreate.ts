import { client } from '@/Main';

type settings_type = {
  once?: boolean;
};

const EVENT_NAME = 'messageCreate';

/** @description Register class as "messageCreate" event for bot */
export function MessageCreate(settings?: settings_type) {
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
