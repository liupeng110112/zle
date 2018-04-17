import { Component } from "./Component";
import { ComponentConstructor } from "./ComponentConstructor";
import { Context } from "./Context";
import { DEFAULT_WAIT_FOR_TIMEOUT } from "./index";
import { ElementHandle } from "puppeteer";

export type SelectSatisfying<T> = (component: T) => Promise<boolean>;

export class ComponentFactory<T> {
  constructor(
    protected context: Context,
    protected _constructor: ComponentConstructor<T>,
    protected scope?: Component
  ) {}

  create(elementHandle: ElementHandle) {
    return new this._constructor(this.context, elementHandle);
  }

  async *selectAll(satisfying?: SelectSatisfying<T>) {
    const scope = this.scope ? this.scope.$elementHandle : this.context.page;
    for (let elementHandle of await scope.$$(
      this._constructor.$definition.selector
    )) {
      const component = await this.create(elementHandle);
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
        throw new Error(
          `Component "${this._constructor.name}" is not unique by selector "${
            this._constructor.$definition.selector
          }"`
        );
      } else {
        uniqueComponent = component;
      }
    }
    return uniqueComponent as T;
  }

  async selectFirst(satisfying?: SelectSatisfying<T>) {
    let firstComponent: T | undefined;
    for await (let component of this.selectAll(satisfying)) {
      firstComponent = component;
      break;
    }
    return firstComponent;
  }

  async waitFor(timeout = DEFAULT_WAIT_FOR_TIMEOUT) {
    let elementHandle = (await Promise.all(
      Array.from(this._constructor.$definition.walkUINodes(true)).map(
        async node => {
          let elementHandle: ElementHandle;
          if (this.scope) {
            elementHandle = await this.context.page.waitForFunction(
              (scopeElement: HTMLElement, selector: string) => {
                return scopeElement.querySelector(selector);
              },
              { timeout, polling: "mutation" },
              this.scope.$elementHandle,
              node.selector
            );
          } else {
            elementHandle = await this.context.page.waitForSelector(
              node.selector,
              {
                timeout
              }
            );
          }
          if (node.satisfying) {
            await new Promise(async (resolve, reject) => {
              const timer = setTimeout(
                () =>
                  reject(
                    `Component ${
                      this._constructor.name
                    } cannot be satisfied: ${timeout}ms`
                  ),
                timeout
              );
              await this.context.page.evaluate(node.satisfying!, elementHandle);
              clearTimeout(timer);
              resolve();
            });
          }
          return elementHandle;
        }
      )
    ))[0];
    if (elementHandle) {
      const component = await this.create(elementHandle);
      return component;
    } else {
      throw new Error(
        `Cannot locate component ${this._constructor.name} by selector "${
          this._constructor.$definition.selector
        }"`
      );
    }
  }
}
