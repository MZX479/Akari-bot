import { config_type } from '#types';

const dev_config: config_type = {
  modules: {
    message_context: true,
    slash: true,
    user_context: true,
  },

  logger: false,
  owner: '544137839462580245',
  errors_channel: '1162645583476043876',
  guild_id: '1162105054300491776',
  allowed_modules: ['Economy', 'Utility', 'Games', 'Shop', 'Moderation'],

  shop: {
    max_item_price: 10e8,
    min_item_price: 100,
    max_item_name_length: 30,
    min_item_name_length: 5,
    max_item_text_length: 100,
    min_item_text_length: 5,
  },
};

export default dev_config;
