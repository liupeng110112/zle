import { Browser, Page } from "puppeteer";
import { Component } from "./Component";
import { ComponentFactory, SatisfyingFunction } from "./ComponentFactory";
import { ComponentConstructor } from "./ComponentConstructor";

export class Context {
  container: any = {};

  constructor(public browser: Browser, public page: Page) {}

  waitFor<T extends Component>(
    constructor: ComponentConstructor<T>,
    timeout?: number
  ): Promise<T> {
    const factory = new ComponentFactory<T>(this, constructor);
    return factory.waitFor(timeout);
  }

  selectAll<T extends Component>(
    constructor: ComponentConstructor<T>,
    satisfying?: SatisfyingFunction<T>
  ) {
    const factory = new ComponentFactory<T>(this, constructor);
    return factory.selectAll(satisfying);
  }

  $$<T extends Component>(
    constructor: ComponentConstructor<T>,
    satisfying?: SatisfyingFunction<T>
  ) {
    return this.selectAll(constructor, satisfying);
  }
}
