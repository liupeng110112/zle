import { DisplayObjectConditionStrategy } from "./Strategies";
import { ComponentConstructor } from "./ComponentConstructor";
import { Context } from "./Context";

export class ComponentConditionStrategy<T extends ComponentConstructor<any>>
  implements DisplayObjectConditionStrategy<T> {
  constructor(
    protected context: Context,
    protected timeout?: number,
    protected selectorPrefix?: string
  ) {}

  async $getConditions(constructor: T) {
    const page = this.context.$getPage();
    const timeout = this.timeout;
    const selectorPrefix = this.selectorPrefix;
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
