import { DisplayObjectConditionStrategy } from "./DisplayObjectConditionStrategy";
import { ComponentConstructor } from "./ComponentConstructor";
import { Context } from "./Context";
import { DEFAULT_WAIT_FOR_TIMEOUT } from "./constants";

export class ComponentConditionStrategy<T extends ComponentConstructor<any>>
  implements DisplayObjectConditionStrategy<T> {
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
        if ((node.satisfying as any) === "visible") {
          return page.waitForSelector(selector, {
            visible: true,
            timeout
          });
        } else if ((node.satisfying as any) === "hidden") {
          return page.waitForSelector(selector, {
            visible: false,
            timeout
          });
        } else if (typeof node.satisfying === "function") {
          return page.waitForFunction(node.satisfying, { timeout }, selector);
        } else {
          return page.waitForSelector(selector, { timeout });
        }
      });
  }
}
