declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [k: string]: undefined | string;
      TOKEN?: string;
      GLOBAL?: string;
      DB_CONNECTION_LINK?: string;
      RULES_CHANNEL_ID?: string;
      RULES_LOGS_CHANNEL_ID?: string;
      GIVEAWAY_CHANNEL_ID?: string;
      GIVEAWAY_LOGS_CHANNEL_ID?: string;
      BOUNTY_CHANNEL_ID?: string;
      BOUNTY_LOGS_CHANNEL_ID?: string;
      DEV?: string;
    }
  }
}

export {};
