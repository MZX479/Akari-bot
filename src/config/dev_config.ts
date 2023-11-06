import { config_type } from '#types';

const dev_config: config_type = {
  modules: {
    message: true,
    slash: true,
    user_context: true,
  },

  logger: false,
  owner: '544137839462580245',
  errors_channel: '1162645583476043876',
  guild_id: '1162105054300491776',
  allowed_modules: ['Economy', 'Utility', 'Games', 'Shop', 'Moderation'],
};

export default dev_config;
