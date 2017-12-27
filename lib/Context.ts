import { Browser, Page, LaunchOptions, launch } from "puppeteer";
import { Component, ComponentConstructor } from "./Component";
import { DEFAULT_WAIT_FOR_TIMEOUT } from "./constants";

export class Context {
  container: any = {};

  static async initialize(options?: LaunchOptions) {
    const browser = await launch(options);
    const page = await browser.newPage();
    page.on("console", msg => {
      console.log(`>>> [${msg.type}] ${msg.text}`);
    });
    return new Context(browser, page);
  }

  protected constructor(protected browser: Browser, protected page: Page) {}

  getBrowser() {
    return this.browser;
  }

  getPage() {
    return this.page;
  }

  async waitFor<T extends Component>(
    constructor: ComponentConstructor<T>,
    timeout?: number,
    scope?: Component
  ): Promise<T> {
    if (!timeout) {
      timeout = DEFAULT_WAIT_FOR_TIMEOUT;
    }
    return new Promise<T>(async (resolve, reject) => {
      const selector = scope
        ? [await scope.$selector, constructor.$definition.selector].join(" ")
        : constructor.$definition.selector;
      const conditions = this.createComponentConditions(
        constructor,
        timeout!,
        selector
      );
      await Promise.all(conditions);
      const handle = await this.page.$(selector);
      if (handle) {
        try {
          const component = await Component.$initialize(
            constructor,
            this,
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

  protected createComponentConditions<T extends Component>(
    constructor: ComponentConstructor<T>,
    timeout: number,
    selectorPrefix: string
  ) {
    return Array.from(constructor.$definition.walkUINodes())
      .filter(node => node.satisfying || !node.hasDescendants)
      .map(node => {
        const selector = [selectorPrefix, node.selector].join(" ");
        if ((node.satisfying as any) === "visible") {
          return this.page.waitForSelector(selector, {
            visible: true,
            timeout
          });
        } else if ((node.satisfying as any) === "hidden") {
          return this.page.waitForSelector(selector, {
            visible: false,
            timeout
          });
        } else if (typeof node.satisfying === "function") {
          return this.page.waitForFunction(
            node.satisfying,
            { timeout },
            selector
          );
        } else {
          return this.page.waitForSelector(selector, { timeout });
        }
      });
  }
}
