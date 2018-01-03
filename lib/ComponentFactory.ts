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
  constructor(
    protected context: Context,
    protected _constructor: ComponentConstructor<T>
  ) {}

  async create(handle: ElementHandle) {
    return new this._constructor(this.context, handle);
  }

  async waitFor(timeout?: number, scope?: Component) {
    const selector = scope
      ? [
          await scope.$getSelector(),
          this._constructor.$definition.selector
        ].join(" ")
      : this._constructor.$definition.selector;
    const strategy = new ComponentSatisfyingStrategy(this.context);
    await Promise.all(
      await strategy.getStrategy(this._constructor, timeout, selector)
    );
    const page = this.context.page;
    const handle = await page.$(selector);
    if (handle) {
      const component = await this.create(handle);
      return component;
    } else {
      throw new Error(
        `Cannot locate component "${
          this._constructor.name
        }" by selector "${selector}"`
      );
    }
  }

  async *selectAll(satisfying?: SatisfyingFunction<T>, scope?: Component) {
    const page = this.context.page;
    const selector = scope
      ? [
          await scope.$getSelector(),
          this._constructor.$definition.selector
        ].join(" ")
      : this._constructor.$definition.selector;
    for (let handle of await page.$$(selector)) {
      const component = await this.create(handle);
      if (!satisfying || (await satisfying(component))) {
        yield component;
      } else {
        continue;
      }
    }
  }
}
