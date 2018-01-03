import { Component } from "./Component";
import { Context } from "./Context";
import { ComponentConstructor } from "./ComponentConstructor";
import { ElementHandle } from "puppeteer";
import { ComponentSatisfyingStrategy } from "./ComponentSatisfyingStrategy";
import { IAsyncFactory } from "./IAsyncFactory";
import { IDisplayObjectFactory } from "./IDisplayObjectFactory";

export type SatisfyingFunction<T> = (component: T) => Promise<boolean>;

export class ComponentFactory<T extends Component>
  implements IAsyncFactory<T>, IDisplayObjectFactory<T> {
  protected satisfyingStrategy = new ComponentSatisfyingStrategy(this.context);

  constructor(protected context: Context) {}

  async create(
    constructor: ComponentConstructor<T>,
    context: Context,
    handle: ElementHandle
  ) {
    return new constructor(context, handle);
  }

  async waitFor(
    constructor: ComponentConstructor<T>,
    timeout?: number,
    scope?: Component
  ) {
    const selector = scope
      ? [await scope.$getSelector(), constructor.$definition.selector].join(" ")
      : constructor.$definition.selector;
    const strategies = await this.satisfyingStrategy.getStrategy(
      constructor,
      timeout,
      selector
    );
    await Promise.all(strategies);
    const page = this.context.page;
    const handle = await page.$(selector);
    if (handle) {
      const component = await this.create(constructor, this.context, handle);
      return component;
    } else {
      throw new Error(
        `Cannot locate component "${
          constructor.name
        }" by selector "${selector}"`
      );
    }
  }

  async *selectAll(
    constructor: ComponentConstructor<T>,
    satisfying?: SatisfyingFunction<T>,
    scope?: Component
  ) {
    const page = this.context.page;
    const selector = scope
      ? [await scope.$getSelector(), constructor.$definition.selector].join(" ")
      : constructor.$definition.selector;
    for (let handle of await page.$$(selector)) {
      const component = await this.create(constructor, this.context, handle);
      if (!satisfying || (await satisfying(component))) {
        yield component;
      } else {
        continue;
      }
    }
  }
}
