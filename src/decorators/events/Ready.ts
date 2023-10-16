import { client } from '@/Main';

type settings_type = {
  once?: boolean;
};

const EVENT_NAME = `ready`;

/** @description Register class as "ready" event for bot */
export function Ready(seetings?: settings_type) {
  return function <T extends { new (...args: any[]): {} }>(
    Target: T,
    context: ClassDecoratorContext
  ) {
    if (seetings?.once)
      client.once(EVENT_NAME, (...args: any) => {
        new Target(...args);
      });
    else
      client.on(EVENT_NAME, (...args: any) => {
        new Target(...args);
      });
  };
}
