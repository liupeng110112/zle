import { Browser, Page } from "puppeteer";
import { Component } from "./Component";
import { ComponentFactory, SatisfyingFunction } from "./ComponentFactory";
import { ComponentConstructor } from "./ComponentConstructor";

export class Context {
  container: any = {};

  constructor(protected browser: Browser, protected page: Page) {}

  getBrowser() {
    return this.browser;
  }

  getPage() {
    return this.page;
  }

  waitFor<T extends Component>(
    constructor: ComponentConstructor<T>,
    timeout?: number
  ): Promise<T> {
    const factory = new ComponentFactory<T>(this);
    return factory.waitFor(constructor, timeout);
  }

  selectAll<T extends Component>(
    constructor: ComponentConstructor<T>,
    satisfying?: SatisfyingFunction<T>
  ) {
    const factory = new ComponentFactory<T>(this);
    return factory.selectAll(constructor, satisfying);
  }

  $$<T extends Component>(
    constructor: ComponentConstructor<T>,
    satisfying?: SatisfyingFunction<T>
  ) {
    return this.selectAll(constructor, satisfying);
  }
}
