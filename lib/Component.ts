import { ElementHandle } from "puppeteer";
import { Context } from "./Context";
import { UIDefinition, UINode } from "./UIDefinition";
import { getCSSPath } from "./helpers";

export type ComponentConstructor<T extends Component> = {
  $definition: UIDefinition;
  new ($context: Context, $handle: ElementHandle, $selector: string): T;
  $initialize<T extends Component>(
    constructor: ComponentConstructor<T>,
    context: Context,
    handle: ElementHandle
  ): Promise<T>;
};

export abstract class Component {
  static $definition: UIDefinition;

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

  static async $initialize<T extends Component>(
    constructor: ComponentConstructor<T>,
    context: Context,
    handle: ElementHandle
  ) {
    const selector = await getCSSPath(context, handle);
    return new constructor(context, handle, selector);
  }

  constructor(
    public $context: Context,
    public $handle: ElementHandle,
    public $selector: string
  ) {}

  protected async $getElementHandleByName(name: string) {
    const constructor = this.constructor as ComponentConstructor<any>;
    if (name === constructor.$definition.name) {
      return this.$handle;
    } else {
      const node = this.$findUINodeByName(name);
      if (node) {
        const page = this.$context.getPage();
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
