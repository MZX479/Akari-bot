declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [k: string]: undefined | string;
      TOKEN?: string;
      GLOBAL?: string;
      DB_CONNECTION_LINK?: string;
      SERVER_ID: string;
      BOUNTY_COLLECTION_NAME: string;
      GIVEAWAY_COLLECTION_NAME: string;
      RULES_COLLECTION_NAME: string;
      MODERATION_COLLECTION_NAME: string;
      POLLS_COLLECTION_NAME: string;
      REMINDERS_COLLECTION_NAME: string;
      PLANNER_COLLECTION_NAME: string;
      RULES_CHANNEL_ID?: string;
      GIVEAWAY_CHANNEL_ID?: string;
      GIVEAWAY_ROLE_ID?: string;
      BOUNTY_CHANNEL_ID?: string;
      BUGS_CHANNEL_ID?: string;
      POLLS_CHANNEL_ID?: string;
      MODERATION_LOGS_CHANNEL_ID?: string;
      LOGS_CHANNEL_ID?: string;
      MAIN_CHANNEL_ID?: string;
      DEV?: string;
    }
  }
}

export {};
