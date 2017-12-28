import { Browser, Page } from "puppeteer";
import { Component } from "./Component";
import { ComponentFactory } from "./ComponentFactory";
import { ComponentConstructor } from "./ComponentConstructor";

export class Context {
  container: any = {};

  constructor(protected browser: Browser, protected page: Page) {}

  $getBrowser() {
    return this.browser;
  }

  $getPage() {
    return this.page;
  }

  async $waitFor<T extends Component>(
    constructor: ComponentConstructor<T>,
    ...args: any[]
  ): Promise<T> {
    const factory = new ComponentFactory<T>(this);
    return factory.$waitFor(constructor, ...args);
  }
}
