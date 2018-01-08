import { ClickOptions, ElementHandle } from "puppeteer";
import { ComponentConstructor } from "./ComponentConstructor";
import { ComponentFactory, SelectSatisfying } from "./ComponentFactory";
import { Context } from "./Context";
import { UIDefinition, UINode } from "./UIDefinition";

export abstract class Component {
  static $kind: "Component" = "Component";
  static $definition: UIDefinition;

  constructor(public $context: Context, public $elementHandle: ElementHandle) {}

  async $findUINodeByName(name: string) {
    for await (let node of this.$walkUINodes()) {
      if (node.name === name) {
        return node;
      }
    }
    return undefined;
  }

  async *$walkUINodes(): AsyncIterableIterator<UINode> {
    const constructor = this.constructor as ComponentConstructor<any>;
    const scopeSelector = await this.$getSelector();
    for await (let {
      selector,
      name,
      satisfying,
      hasDescendants
    } of constructor.$definition.walkUINodes()) {
      yield {
        selector: [scopeSelector, selector].join(" "),
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
      const node = await this.$findUINodeByName(name);
      if (node) {
        const page = this.$context.page;
        const selector = node.selector;
        const elementHandle = await page.$(selector);
        if (elementHandle) {
          return elementHandle;
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

  async $getSelector() {
    const page = this.$context.page;
    const selector: string | undefined = await page.evaluate(
      /* istanbul ignore next */
      (el: HTMLElement) => {
        const segments = new Array<string>();
        let node = el;
        while (node) {
          const parent = node.parentElement!;
          if (parent) {
            const siblings = Array.from(parent.children);
            if (node.localName !== "body" && siblings.length > 1) {
              segments.push(
                `${node.localName}:nth-child(${siblings.indexOf(node) + 1})`
              );
            } else {
              segments.push(node.localName!);
            }
          } else if (node.localName === "html") {
            segments.push(node.localName!);
          } else {
            return undefined;
          }
          node = parent;
        }
        segments.reverse();
        return segments.join(" > ");
      },
      this.$elementHandle
    );
    if (selector) {
      return selector;
    } else {
      throw new Error(`Component ${this} is break away from DOM`);
    }
  }
}
