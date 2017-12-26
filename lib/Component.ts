import { IDisplayObject, IDisplayObjectConstructor } from "./DisplayObject";
import { IUIDefinition } from "./UIDefinition";
import { ElementHandle } from "puppeteer";
import { IContext } from "./Context";
import { DEFAULT_WAIT_FOR_TIMEOUT } from "./constants";

export interface IComponent extends IDisplayObject {
  $getPath(): Promise<string>;
}

export interface IComponentConstructor<T extends IComponent> extends IDisplayObjectConstructor<T> {
  $definition: IUIDefinition;

  new($context: IContext, $handle: ElementHandle): T;
  $waitFor<T extends IComponent>(constructor: IComponentConstructor<T>, context: IContext, timeout?: number, scope?: IComponent): Promise<T>;
}

export abstract class Component implements IComponent {
  static $definition: IUIDefinition;

  static $waitFor<T extends IComponent>(constructor: IComponentConstructor<T>, context: IContext, timeout?: number, scope?: IComponent): Promise<T> {
    if (!timeout) {
      timeout = DEFAULT_WAIT_FOR_TIMEOUT;
    }
    return new Promise<T>(async (resolve, _) => {
      const page = await context.getPage();
      const preconditions = Array.from(constructor.$definition.walkUINodes())
                                 .filter((node) => !node.hasDescendants)
                                 .map((node) => page.waitForSelector(node.path.join(' '), { timeout }));
      await Promise.all(preconditions);
      const selector = constructor.$definition.selector;
      const handle = await page.$(selector);
      resolve(new constructor(context, handle!));
    });
  }

  constructor(protected $context: IContext, protected $handle: ElementHandle) {
  }

  async $getPath() {
    const page = await this.$context.getPage();
    const path: string = await page.evaluate((el: HTMLElement) => {
      const segments = new Array<string>();
      let node = el;
      while (node) {
        const parent = node.parentElement!;
        if (parent) {
          const siblings = Array.from(parent.children)
                                .filter((el) => {
                                  return el.localName === node.localName;
                                });
          if (siblings.length > 1) {
            segments.push(`${node.localName}:nth-child(${siblings.indexOf(node) + 1})`);
          } else {
            segments.push(node.localName!);
          }
        } else {
          segments.push(node.localName!);
        }
        node = parent;
      }
      segments.reverse();
      return segments.join(' > ');
    }, this.$handle);
    return path;
  }
}
