declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [k: string]: undefined | string;
      TOKEN?: string;
      GLOBAL?: string;
      DB_CONNECTION_LINK?: string;
      RULES_CHANNEL_ID?: string;
      LOGS_CHANNEL_ID?: string;
      DEV?: string;
    }
  }
}

export {};
