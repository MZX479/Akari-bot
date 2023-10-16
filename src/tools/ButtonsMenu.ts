import { CustomError, PageWithComponentsType } from '#types';
import { InteractionTemplate } from '@/config/templates';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CollectedInteraction,
  CommandInteraction,
  Interaction,
  InteractionCollector,
  Message,
  TextChannel,
} from 'discord.js';
import duration from 'parse-duration';
import { format_error } from './FormatError';
import { handle_error } from './handle_error';

type listener_callback_type = (i: Interaction, menu: ButtonMenu) => any;

type listeners_list_type = {
  [custom_id: string]: listener_callback_type;
};

type filter_type = (interaction: Interaction) => boolean;

enum ButtonsEnum {
  Prev = 'previous_page',
  Next = 'next_page',
}

const registered_buttons: Readonly<string[]> = [
  ButtonsEnum.Prev,
  ButtonsEnum.Next,
];

const default_time = 30000; //duration('3m');

/** @description Builder for interactieve menu with pages
 * @example new ButtonMenu()
 * .set_channel(interaction.channel)
 * .set_pages(pages)
 * .start()
 */
export class ButtonMenu {
  private _pages: PageWithComponentsType[] | null = null;
  private _channel: TextChannel | null = null;
  private _filter: filter_type | null = null;
  private _time: number = default_time;
  private _interaction: CommandInteraction | null = null;
  private _custom_components: ActionRowBuilder[] | null = null;

  private _menu_message: Message | null = null;
  private _current_page: number = 0;
  private _custom_buttons: ButtonBuilder[] | null = null;
  private _listeners_list: listeners_list_type = {};
  private _collector: InteractionCollector<CollectedInteraction> | null = null;

  launched: boolean = false;

  private _prev_page_button = new ButtonBuilder()
    .setCustomId(ButtonsEnum.Prev)
    .setStyle(ButtonStyle.Secondary)
    .setEmoji('⬅️')
    .setLabel('Назад')
    .setDisabled(true);

  private _next_page_button = new ButtonBuilder()
    .setCustomId(ButtonsEnum.Next)
    .setStyle(ButtonStyle.Secondary)
    .setEmoji('➡️')
    .setLabel('Вперед');

  get pages() {
    return this._pages;
  }

  /**
   * @description Set channel to send menu
   * @required or use set_interaction
   */
  set_channel(channel: TextChannel): this {
    try {
      this._channel = channel;
      return this;
    } catch (e) {
      format_error(e as CustomError, '[ButtonsMenu] set_channel');
      throw e;
    }
  }

  /**
   *  @description If no channel is specified, bot will send menu by editing specified interaction
   *  @required or use set_channel
   */
  set_interaction(interaction: CommandInteraction): this {
    try {
      this._interaction = interaction;
      return this;
    } catch (e) {
      format_error(e as CustomError, '[ButtonsMenu] set_interaction');
      throw e;
    }
  }

  /**
   *  @description Set life time for menu
   *  @optional
   */
  set_time(time: number): this {
    try {
      const max = duration('1d') || 0;
      if (time > max)
        throw new Error("You can't specify time more than 1 day!");

      if (time <= 0)
        throw new Error(
          "You entered a wrong time! Time can't be less or equals to 0",
        );
      this._time = time;
      return this;
    } catch (e) {
      format_error(e as CustomError, '[ButtonsMenu] set_time');
      throw e;
    }
  }

  /**
   *  @description Set filter for each interaction for current menu
   *  @optional
   */
  set_filter(filter: filter_type): this {
    try {
      this._filter = filter;
      return this;
    } catch (e) {
      format_error(e as CustomError, '[ButtonsMenu] set_filter');
      throw e;
    }
  }

  /**
   *  @description Set pages for your menu
   *  @required
   */
  set_pages(pages: PageWithComponentsType[]): this {
    try {
      if (!pages[0]) throw new Error('Pages array cannot be empty');
      this._pages = pages;
      this.change_current_page(pages[this._current_page]);
      return this;
    } catch (e) {
      format_error(e as CustomError, '[ButtonsMenu] set_pages');
      throw e;
    }
  }

  /**
   *  @description Add custom buttons in the additional to default ones
   *  @optional
   */
  set_custom_buttons(...buttons: ButtonBuilder[]): this {
    try {
      if (buttons.length > 3)
        throw new Error("You can't set more than 3 custom buttons");
      this._custom_buttons = buttons;
      return this;
    } catch (e) {
      format_error(e as CustomError, '[ButtonsMenu] set_custom_buttons');
      throw e;
    }
  }

  /**
   *  @description Add custom components in the additional to default ones
   *  @optional
   */
  set_custom_components(...components: ActionRowBuilder[]): this {
    try {
      if (components.length > 4)
        throw new Error("You can't set more than 4 custom components");
      this._custom_components = components;
      return this;
    } catch (e) {
      format_error(e as CustomError, '[ButtonsMenu] set_custom_components');
      throw e;
    }
  }

  /**
   *  @description Add custon events listener for interaction by their custom id
   *  @optional
   */
  add_listener(custom_id: string, callback: listener_callback_type): this {
    try {
      this._listeners_list[custom_id] = callback;
      return this;
    } catch (e) {
      format_error(e as CustomError, '[ButtonsMenu] add_listener');
      throw e;
    }
  }

  /**
   *  @description Remove custom events listener by their custom id
   *  @optional
   */
  remove_listener(custom_id: string): this {
    try {
      if (custom_id in this._listeners_list)
        delete this._listeners_list[custom_id];

      return this;
    } catch (e) {
      format_error(e as CustomError, '[ButtonsMenu] remove_listener');
      throw e;
    }
  }

  async change_current_page(page: PageWithComponentsType): Promise<this> {
    try {
      if (!this._pages) return this;
      this._pages[this._current_page] = page;
      await this._update_menu();

      return this;
    } catch (e) {
      format_error(e as CustomError, '[ButtonsMenu] set_current_page');
      throw e;
    }
  }

  async next_page(): Promise<this> {
    try {
      if (!this._pages) return this;
      if (this._current_page + 1 > this._pages.length - 1) return this;
      ++this._current_page;
      await this._update_menu();

      return this;
    } catch (e) {
      format_error(e as CustomError, '[ButtonsMenu] next_page');
      throw e;
    }
  }

  async previous_page(): Promise<this> {
    try {
      if (this._current_page - 1 < 0) return this;
      --this._current_page;
      await this._update_menu();

      return this;
    } catch (e) {
      format_error(e as CustomError, '[ButtonsMenu] previous_page');
      throw e;
    }
  }

  /**
   *  @description Launch menu
   *  @required
   */
  async start() {
    try {
      if (this.launched) return;

      await this._build();
      await this._listen();
    } catch (e) {
      format_error(e as CustomError, '[ButtonsMenu] start');
      throw e;
    }
  }

  async stop() {
    try {
      await this._menu_message?.edit({
        components: [],
      });
      await this._collector?.stop();
    } catch (e) {
      format_error(e as CustomError, '[ButtonsMenu] stop');
      throw e;
    }
  }

  private async _build() {
    try {
      if (!this._channel && !this._interaction)
        throw new Error('No channel or interaction specified to send menu');
      if (!this._pages || !this._pages[0])
        throw new Error('No pages specified');

      const components = this._get_components() as any;

      const embed = this._pages[this._current_page].page;

      if (this._interaction) {
        this._menu_message = await new InteractionTemplate(
          this._interaction,
        ).send({
          embeds: [embed],
          components: components,
        });
      } else if (this._channel)
        this._menu_message = await this._channel.send({
          embeds: [embed],
          components: components,
        });

      this.launched = true;
    } catch (e) {
      format_error(e as CustomError, '[ButtonsMenu] _build');
      throw e;
    }
  }

  private _listen() {
    try {
      if (!this._menu_message) throw new Error("Menu message isn't exist.");
      const filter = this._filter || (() => true);

      const collector = this._menu_message.createMessageComponentCollector<any>(
        {
          filter,
          time: this._time,
        },
      );

      collector.on('collect', this._change_page.bind(this));
      collector.on('collect', this._handle_listeners.bind(this));

      collector.on('end', this.stop.bind(this));

      this._collector = collector;
    } catch (e) {
      format_error(e as CustomError, '[ButtonsMenu] _listen');
      // throw e;
    }
  }

  private async _change_page(button: Interaction) {
    try {
      if (!this.launched) return;

      if (!button.isButton()) return;
      if (!registered_buttons.includes(button.customId)) return;

      if (!this._pages) return;
      await button.update({
        components: button.message.components,
      });

      const custom_id = button.customId as ButtonsEnum;

      switch (custom_id) {
        case ButtonsEnum.Prev:
          await this.previous_page();
          break;

        case ButtonsEnum.Next:
          await this.next_page();
          break;
      }
    } catch (e) {
      const error = e as CustomError;
      handle_error(error, '[ButtonsMenu] _change_page');
    }
  }

  private _handle_listeners(interaction: Interaction) {
    try {
      if (!interaction.isMessageComponent()) return;

      if (!(interaction.customId in this._listeners_list)) return;

      this._listeners_list[interaction.customId](interaction, this);
    } catch (e) {
      const error = e as CustomError;
      handle_error(error, '[ButtonsMenu] _handle_listeners');
    }
  }

  private async _update_menu() {
    try {
      if (!this.launched) return;
      if (!this._pages) throw new Error('No pages specified');

      const current_page = this._current_page;
      if (current_page - 1 < 0) this._prev_page_button.setDisabled(true);
      else this._prev_page_button.setDisabled(false);

      if (current_page + 1 > this._pages.length - 1)
        this._next_page_button.setDisabled(true);
      else this._next_page_button.setDisabled(false);

      const components = this._get_components() as any;
      const pages = this._pages;

      await this._menu_message?.edit({
        embeds: [pages[current_page].page],
        components,
      });
    } catch (e) {
      format_error(e as CustomError, '[ButtonsMenu] _update_menu');
      throw e;
    }
  }

  private _get_buttons() {
    try {
      const custom_buttons = this._custom_buttons || [];

      return [
        this._prev_page_button,
        ...custom_buttons,
        this._next_page_button,
      ];
    } catch (e) {
      format_error(e as CustomError, '[ButtonsMenu] _get_buttons');
      throw e;
    }
  }

  private _get_components() {
    try {
      if (!this._pages) return;
      const custom_components = this._custom_components || [];

      const buttons = this._get_buttons();
      const buttons_component = new ActionRowBuilder()
        .setComponents(...buttons)
        .toJSON();

      const result = [];
      const page_components = this._pages[this._current_page].components;

      if (this._pages.length > 1) result.push(buttons_component);

      if (page_components) result.push(page_components);

      if (custom_components && custom_components[0])
        result.push(...custom_components);

      return result;
    } catch (e) {
      format_error(e as CustomError, '[ButtonsMenu] _get_components');
      throw e;
    }
  }
}
