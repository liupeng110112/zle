import { ComponentConstructor } from './ComponentConstructor';
import { Context } from './Context';
import { DEFAULT_WAIT_FOR_TIMEOUT } from './constants';
import { ISatisfyingStrategy } from './ISatisfyingStrategy';
import { setTimeout } from 'timers';

export class ComponentSatisfyingStrategy<T extends ComponentConstructor<any>>
  implements ISatisfyingStrategy<T> {
  constructor(protected context: Context) {}

  async getStrategy(constructor: T, timeout?: number, scopeSelector?: string) {
    if (!timeout) {
      timeout = DEFAULT_WAIT_FOR_TIMEOUT;
    }
    const page = this.context.page;
    return Array.from(constructor.$definition.walkUINodes())
      .filter(node => node.satisfying || !node.hasDescendants)
      .map(node => {
        const selector = [scopeSelector, node.selector].join(" ");
        if (node.satisfying === "visible") {
          return page.waitForSelector(selector, {
            visible: true,
            timeout
          });
        } else if (node.satisfying === "hidden") {
          return page.waitForSelector(selector, {
            visible: false,
            timeout
          });
        } else if (node.satisfying) {
          return new Promise<void>(async (resolve, reject) => {
            setTimeout(() => reject(`Time exceed: ${timeout}ms`), timeout!);
            await page.waitForSelector(selector);
            const handle = await page.$(selector);
            await page.evaluate(node.satisfying!, handle);
            resolve();
          });
        } else {
          return page.waitForSelector(selector, { timeout });
        }
      });
  }
}
