import { Browser, Page } from "puppeteer";
import { Component } from "./Component";
import { ComponentFactory } from "./ComponentFactory";
import { ComponentConstructor } from "./ComponentConstructor";
import { IDisplayObjectFactory } from "./IDisplayObjectFactory";

export class Context implements IDisplayObjectFactory<any> {
  container: any = {};

  constructor(protected browser: Browser, protected page: Page) {}

  $getBrowser() {
    return this.browser;
  }

  $getPage() {
    return this.page;
  }

  $waitFor<T extends Component>(
    constructor: ComponentConstructor<T>,
    timeout?: number,
    ...args: any[]
  ): Promise<T> {
    const factory = new ComponentFactory<T>(this);
    return factory.$waitFor(constructor, timeout, ...args);
  }
}
