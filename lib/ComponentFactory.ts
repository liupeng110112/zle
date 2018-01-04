import { Component } from './Component';
import { ComponentConstructor } from './ComponentConstructor';
import { Context } from './Context';
import { DEFAULT_WAIT_FOR_TIMEOUT } from './constants';
import { ElementHandle } from 'puppeteer';

export type SelectSatisfying<T> = (component: T) => Promise<boolean>;

export class ComponentFactory<T extends Component> {
  constructor(
    protected context: Context,
    protected _constructor: ComponentConstructor<T>,
    protected scope?: Component
  ) {}

  async create(handle: ElementHandle) {
    return new this._constructor(this.context, handle);
  }

  async *selectAll(satisfying?: SelectSatisfying<T>) {
    const page = this.context.page;
    const selector = await this.getComponentSelector();
    for (let handle of await page.$$(selector)) {
      const component = await this.create(handle);
      if (!satisfying || (await satisfying(component))) {
        yield component;
      } else {
        continue;
      }
    }
  }

  async selectUnique(satisfying?: SelectSatisfying<T>) {
    let uniqueComponent: T | undefined;
    for await (let component of this.selectAll(satisfying)) {
      if (uniqueComponent) {
        const selector = await this.getComponentSelector();
        throw new Error(
          `Component "${
            this._constructor.name
          }" is not unique by selector "${selector}"`
        );
      } else {
        uniqueComponent = component;
      }
    }
    return uniqueComponent;
  }

  async selectFirst(satisfying?: SelectSatisfying<T>) {
    let firstComponent: T | undefined;
    for await (let component of this.selectAll(satisfying)) {
      firstComponent = component;
      break;
    }
    return firstComponent;
  }

  async waitFor(timeout?: number) {
    if (!timeout) {
      timeout = DEFAULT_WAIT_FOR_TIMEOUT;
    }
    const selector = await this.getComponentSelector();
    const page = this.context.page;
    await Promise.all(
      Array.from(this._constructor.$definition.walkUINodes())
        .filter(node => node.satisfying || !node.hasDescendants)
        .map(node => {
          const nodeSelector = [selector, node.selector].join(" ");
          if (node.satisfying === "visible") {
            return page.waitForSelector(nodeSelector, {
              visible: true,
              timeout
            });
          } else if (node.satisfying === "hidden") {
            return page.waitForSelector(nodeSelector, {
              visible: false,
              timeout
            });
          } else if (node.satisfying) {
            return new Promise<void>(async (resolve, reject) => {
              setTimeout(() => reject(`Time exceed: ${timeout}ms`), timeout!);
              await page.waitForSelector(nodeSelector);
              const handle = await page.$(nodeSelector);
              await page.evaluate(node.satisfying!, handle);
              resolve();
            });
          } else {
            return page.waitForSelector(nodeSelector, { timeout });
          }
        })
    );
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

  protected async getComponentSelector() {
    if (this.scope) {
      return [
        await this.scope.$getSelector(),
        this._constructor.$definition.selector
      ].join(" ");
    } else {
      return this._constructor.$definition.selector;
    }
  }
}
