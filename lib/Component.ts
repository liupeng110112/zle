import { ElementHandle, ClickOptions } from "puppeteer";
import { Context } from "./Context";
import { UIDefinition, UINode } from "./UIDefinition";
import { ComponentConstructor } from "./ComponentConstructor";

export abstract class Component {
  static $definition: UIDefinition;
  protected page = this.$context.$getPage();

  constructor(
    public $context: Context,
    public $handle: ElementHandle,
    public $selector: string
  ) {}

  $findUINodeByName(name: string) {
    for (let node of this.$walkUINodes()) {
      if (node.name === name) {
        return node;
      }
    }
    return undefined;
  }

  *$walkUINodes(): IterableIterator<UINode> {
    const constructor = this.constructor as ComponentConstructor<any>;
    const selectorPrefix = this.$selector;
    for (let {
      selector,
      name,
      satisfying,
      hasDescendants
    } of constructor.$definition.walkUINodes()) {
      yield {
        selector: [selectorPrefix, selector].join(" "),
        name,
        satisfying,
        hasDescendants
      };
    }
  }

  async $click(name: string, options?: ClickOptions) {
    const handle = await this.$getElementHandleByName(name);
    return handle.click(options);
  }

  async $press(
    name: string,
    key: string,
    options?: { text?: string; delay?: number }
  ) {
    const handle = await this.$getElementHandleByName(name);
    return handle.press(key, options);
  }

  async $type(name: string, text: string, options?: { delay: number }) {
    const handle = await this.$getElementHandleByName(name);
    return handle.type(text, options);
  }

  async $textOf(name: string) {
    const handle = await this.$getElementHandleByName(name);
    const result: string = await this.page.evaluate(
      (el: HTMLElement) => el.textContent,
      handle
    );
    return result;
  }

  async $htmlOf(name: string) {
    const handle = await this.$getElementHandleByName(name);
    const result: string = await this.page.evaluate(
      (el: HTMLElement) => el.innerHTML,
      handle
    );
    return result;
  }

  async $getElementHandleByName(name: string) {
    const constructor = this.constructor as ComponentConstructor<any>;
    if (name === constructor.$definition.name) {
      return this.$handle;
    } else {
      const node = this.$findUINodeByName(name);
      if (node) {
        const page = this.$context.$getPage();
        const selector = node.selector;
        const handle = await page.$(selector);
        if (handle) {
          return handle;
        } else {
          throw new Error(
            `Cannot locate UINode "${name}" by selector "${selector}"`
          );
        }
      } else {
        throw new Error(`Cannot find UINode by name "${name}"`);
      }
    }
  }
}
