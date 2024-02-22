import { Logger } from '@/config/LoggerLoader';
import { client } from '../Main';

type event_callback = (args: any[]) => Promise<any> | any;

/** @description Loader for Client's events */
export class EventsLoader {
  /** @description Register callback as Client's event */
  load(event_name: string, callback: event_callback) {
    client.on(event_name, (...args: any[]) => {
      Logger.log(`Event initialised: ${event_name}`);
      callback(args);
    });
  }
}
