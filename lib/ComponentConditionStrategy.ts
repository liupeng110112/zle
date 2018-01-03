import { IConditionStrategy } from "./IConditionStrategy";
import { ComponentConstructor } from "./ComponentConstructor";
import { Context } from "./Context";
import { DEFAULT_WAIT_FOR_TIMEOUT } from "./constants";
import { setTimeout } from "timers";

export class ComponentConditionStrategy<T extends ComponentConstructor<any>>
  implements IConditionStrategy<T> {
  constructor(protected context: Context) {}

  async $getConditions(
    constructor: T,
    timeout?: number,
    selectorPrefix?: string
  ) {
    if (!timeout) {
      timeout = DEFAULT_WAIT_FOR_TIMEOUT;
    }
    const page = this.context.$getPage();
    return Array.from(constructor.$definition.walkUINodes())
      .filter(node => node.satisfying || !node.hasDescendants)
      .map(node => {
        const selector = [selectorPrefix, node.selector].join(" ");
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
