import { IDisplayObjectConstructor, IDisplayObject } from './DisplayObject';
import { Browser, Page, LaunchOptions, launch } from 'puppeteer';

export interface IContext {
  container: any;

  getBrowser(): Browser;
  getPage(): Page;
  waitFor<T extends IDisplayObject>(constructor: IDisplayObjectConstructor<T>, timeout?: number): Promise<T>;
}

export interface IContextConstructor<T extends IContext> {
  new(browser: Browser): T;
  initialize(): Promise<IContext>;
}

export class Context implements IContext {
  container: any = {};

  static async initialize(options?: LaunchOptions) {
    const browser = await launch(options);
    const page = await browser.newPage();
    page.on('console', (msg) => {
      console.log(`>>> [${msg.type}] ${msg.text}`);
    });
    return new Context(browser, page);
  }

  protected constructor(protected browser: Browser, protected page: Page) {
  }

  getBrowser() {
    return this.browser;
  }

  getPage() {
    return this.page;
  }

  waitFor<T extends IDisplayObject>(constructor: IDisplayObjectConstructor<T>, timeout?: number): Promise<T> {
    return constructor.$waitFor(constructor, this, timeout);
  }
}
