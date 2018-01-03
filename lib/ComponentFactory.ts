import { Component } from './Component';
import { ComponentConstructor } from './ComponentConstructor';
import { ComponentSatisfyingStrategy } from './ComponentSatisfyingStrategy';
import { Context } from './Context';
import { ElementHandle } from 'puppeteer';
import { IAsyncFactory } from './IAsyncFactory';
import { IDisplayObjectFactory } from './IDisplayObjectFactory';

export type SatisfyingFunction<T> = (component: T) => Promise<boolean>;

export class ComponentFactory<T extends Component>
  implements IAsyncFactory<T>, IDisplayObjectFactory<T> {
  constructor(
    protected context: Context,
    protected _constructor: ComponentConstructor<T>,
    protected scope?: Component
  ) {}

  async create(handle: ElementHandle) {
    return new this._constructor(this.context, handle);
  }

  async waitFor(timeout?: number) {
    const selector = await this.getSelector();
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

  async *selectAll(satisfying?: SatisfyingFunction<T>) {
    const page = this.context.page;
    const selector = await this.getSelector();
    for (let handle of await page.$$(selector)) {
      const component = await this.create(handle);
      if (!satisfying || (await satisfying(component))) {
        yield component;
      } else {
        continue;
      }
    }
  }

  async selectUnique(satisfying?: SatisfyingFunction<T>) {
    let uniqueComponent: T | undefined;
    for await (let component of this.selectAll(satisfying)) {
      if (uniqueComponent) {
        uniqueComponent = undefined;
        break;
      } else {
        uniqueComponent = component;
      }
    }
    return uniqueComponent;
  }

  async selectFirst(satisfying?: SatisfyingFunction<T>) {
    let firstComponent: T | undefined;
    for await (let component of this.selectAll(satisfying)) {
      firstComponent = component;
      break;
    }
    return firstComponent;
  }

  async getSelector() {
    if (this.scope) {
      return await this.scope.$getSelector();
    } else {
      return this._constructor.$definition.selector;
    }
  }
}
