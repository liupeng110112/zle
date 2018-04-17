import { chain } from "./Chain";
import { Chainable } from "./Chain";
import { ClickOptions, ElementHandle } from "puppeteer";
import { ComponentConstructor } from "./ComponentConstructor";
import { ComponentFactory, SelectSatisfying } from "./ComponentFactory";
import { Context } from "./Context";
import { UIDefinition, UINode } from "./UIDefinition";

export abstract class Component {
  static $kind: "Component" = "Component";
  static $definition: UIDefinition;

  constructor(public $context: Context, public $elementHandle: ElementHandle) {}

  $inspect(callback: (self: this) => Promise<void>): Chainable<this> {
    return chain(async () => {
      await callback(this);
      return this;
    });
  }

  async $findUINode(name: string) {
    for await (let node of this.$walkUINodes()) {
      if (node.name === name) {
        return node;
      }
    }
    return undefined;
  }

  async *$walkUINodes(): AsyncIterableIterator<UINode> {
    const constructor = this.constructor as ComponentConstructor<any>;
    for await (let {
      selector,
      name,
      satisfying,
      hasDescendants
    } of constructor.$definition.walkUINodes()) {
      yield {
        selector: selector,
        name,
        satisfying,
        hasDescendants
      };
    }
  }

  async $click(name: string, options?: ClickOptions) {
    const elementHandle = await this.$getElementHandleByName(name);
    return elementHandle.click(options);
  }

  async $press(
    name: string,
    key: string,
    options?: { text?: string; delay?: number }
  ) {
    const elementHandle = await this.$getElementHandleByName(name);
    return elementHandle.press(key, options);
  }

  async $type(name: string, text: string, options?: { delay: number }) {
    const elementHandle = await this.$getElementHandleByName(name);
    return elementHandle.type(text, options);
  }

  async $hover(name: string) {
    const elementHandle = await this.$getElementHandleByName(name);
    return elementHandle.hover();
  }

  async $textOf(name: string) {
    const elementHandle = await this.$getElementHandleByName(name);
    const text: string = await this.$context.page.evaluate(
      /* istanbul ignore next */
      (el: HTMLElement) => el.textContent,
      elementHandle
    );
    return text;
  }

  async $htmlOf(name: string) {
    const elementHandle = await this.$getElementHandleByName(name);
    /* istanbul ignore next */
    const html: string = await this.$context.page.evaluate(
      (el: HTMLElement) => el.innerHTML,
      elementHandle
    );
    return html;
  }

  async $getElementHandleByName(name: string) {
    const constructor = this.constructor as ComponentConstructor<any>;
    if (name === constructor.$definition.name) {
      return this.$elementHandle;
    } else {
      const node = await this.$findUINode(name);
      if (node) {
        const elementHandle = await this.$elementHandle.$(node.selector);
        if (elementHandle) {
          return elementHandle;
        } else {
          throw new Error(
            `Cannot locate UINode "${name}" by selector "${node.selector}"`
          );
        }
      } else {
        throw new Error(`Cannot find UINode by name "${name}"`);
      }
    }
  }

  $selectAll = <T extends Component>(
    constructor: ComponentConstructor<T>,
    satisfying?: SelectSatisfying<T>
  ) => {
    const factory = new ComponentFactory(this.$context, constructor, this);
    return factory.selectAll(satisfying);
  };
  $$ = this.$selectAll;

  $selectUnique = <T extends Component>(
    constructor: ComponentConstructor<T>,
    satisfying?: SelectSatisfying<T>
  ) => {
    const factory = new ComponentFactory(this.$context, constructor, this);
    return factory.selectUnique(satisfying);
  };
  $_ = this.$selectUnique;

  $selectFirst = <T extends Component>(
    constructor: ComponentConstructor<T>,
    satisfying?: SelectSatisfying<T>
  ) => {
    const factory = new ComponentFactory(this.$context, constructor, this);
    return factory.selectFirst(satisfying);
  };
  $ = this.$selectFirst;

  $waitFor<T extends Component>(
    constructor: ComponentConstructor<T>,
    timeout?: number
  ) {
    const factory = new ComponentFactory(this.$context, constructor, this);
    return factory.waitFor(timeout);
  }
}
