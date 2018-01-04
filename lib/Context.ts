import { Browser, Page } from 'puppeteer';
import { Component } from './Component';
import { ComponentConstructor } from './ComponentConstructor';
import { ComponentFactory, SelectSatisfying } from './ComponentFactory';
import { DisplayObjectConstructor } from './DisplayObjectConstructor';
import { DisplayObjectFactory } from './DisplayObjectFactory';
import { PageObjectFactory } from './PageObjectFactory';

export type WaitForOptions = {
  timeout?: number;
  url?: string;
};

export class Context {
  container: any = {};

  constructor(public browser: Browser, public page: Page) {}

  waitFor<T>(
    constructor: DisplayObjectConstructor<T>,
    options?: WaitForOptions
  ): Promise<T> {
    options = options || {};
    let factory: DisplayObjectFactory<T>;
    if (constructor.$kind === "Component") {
      factory = new ComponentFactory(this, constructor);
    } else {
      factory = new PageObjectFactory(this, constructor, options.url);
    }
    return factory.waitFor(options.timeout);
  }

  selectAll = <T extends Component>(
    constructor: ComponentConstructor<T>,
    satisfying?: SelectSatisfying<T>
  ) => {
    const factory = new ComponentFactory<T>(this, constructor);
    return factory.selectAll(satisfying);
  };
  $$ = this.selectAll;

  selectUnique = <T extends Component>(
    constructor: ComponentConstructor<T>,
    satisfying?: SelectSatisfying<T>
  ) => {
    const factory = new ComponentFactory<T>(this, constructor);
    return factory.selectUnique(satisfying);
  };
  $_ = this.selectUnique;

  selectFirst = <T extends Component>(
    constructor: ComponentConstructor<T>,
    satisfying?: SelectSatisfying<T>
  ) => {
    const factory = new ComponentFactory<T>(this, constructor);
    return factory.selectFirst(satisfying);
  };
  $ = this.selectFirst;
}
