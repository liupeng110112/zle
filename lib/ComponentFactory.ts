import { Component } from "./Component";
import { getCSSPath } from "./helpers";
import { DEFAULT_WAIT_FOR_TIMEOUT } from "./constants";
import { Context } from "./Context";
import { IAsyncFactory, IDisplayObjectFactory } from "./Factories";
import { ComponentConstructor } from "./ComponentConstructor";
import { ElementHandle } from "puppeteer";
import { ComponentConditionStrategy } from "./ComponentConditionStrategy";

export class ComponentFactory<T extends Component>
  implements IAsyncFactory<T>, IDisplayObjectFactory<T> {
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
    if (!timeout) {
      timeout = DEFAULT_WAIT_FOR_TIMEOUT;
    }
    return new Promise<T>(async (resolve, reject) => {
      const selector = scope
        ? [await scope.$selector, constructor.$definition.selector].join(" ")
        : constructor.$definition.selector;
      const strategy = new ComponentConditionStrategy(
        this.context,
        timeout,
        selector
      );
      const conditions = await strategy.$getConditions(constructor);
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
