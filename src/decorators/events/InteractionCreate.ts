import { client } from '@/Main';

type settings_type = {
  once?: boolean;
};

const EVENT_NAME = 'interactionCreate';

/** @description Register class as "interactionCreate" event for bot */
export function InteractionCreate(settings?: settings_type) {
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
