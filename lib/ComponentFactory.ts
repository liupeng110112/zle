import { Component } from "./Component";
import { Context } from "./Context";
import { ComponentConstructor } from "./ComponentConstructor";
import { ElementHandle } from "puppeteer";
import { ComponentConditionStrategy } from "./ComponentConditionStrategy";
import { IAsyncFactory } from "./IAsyncFactory";
import { IDisplayObjectFactory } from "./IDisplayObjectFactory";

export class ComponentFactory<T extends Component>
  implements IAsyncFactory<T>, IDisplayObjectFactory<T> {
  protected conditionStrategy = new ComponentConditionStrategy(this.context);

  constructor(protected context: Context) {}

  async $create(
    constructor: ComponentConstructor<T>,
    context: Context,
    handle: ElementHandle
  ) {
    const selector = await getCSSPath(context, handle);
    return new constructor(context, handle, selector);
  }

  $waitFor(
    constructor: ComponentConstructor<T>,
    timeout?: number,
    scope?: Component
  ) {
    return new Promise<T>(async (resolve, reject) => {
      const selector = scope
        ? [await scope.$selector, constructor.$definition.selector].join(" ")
        : constructor.$definition.selector;
      const conditions = await this.conditionStrategy.$getConditions(
        constructor,
        timeout,
        selector
      );
      await Promise.all(conditions);
      const page = this.context.$getPage();
      const handle = await page.$(selector);
      if (handle) {
        try {
          const component = await this.$create(
            constructor,
            this.context,
            handle
          );
          resolve(component);
        } catch (err) {
          reject(err);
        }
      } else {
        reject(
          new Error(
            `Cannot locate component "${
              constructor.name
            }" by selector "${selector}"`
          )
        );
      }
    });
  }
}

async function getCSSPath(context: Context, handle: ElementHandle) {
  const page = context.$getPage();
  const path: string = await page.evaluate((el: HTMLElement) => {
    const segments = new Array<string>();
    let node = el;
    while (node) {
      const parent = node.parentElement!;
      if (parent) {
        const siblings = Array.from(parent.children).filter(el => {
          return el.localName === node.localName;
        });
        if (siblings.length > 1) {
          segments.push(
            `${node.localName}:nth-child(${siblings.indexOf(node) + 1})`
          );
        } else {
          segments.push(node.localName!); // only child
        }
      } else {
        segments.push(node.localName!); // met element 'html'
      }
      node = parent;
    }
    segments.reverse();
    return segments.join(" > ");
  }, handle);
  return path;
}
