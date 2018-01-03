import { Browser, Page } from 'puppeteer';
import { Component } from './Component';
import { ComponentConstructor } from './ComponentConstructor';
import { ComponentFactory, SatisfyingFunction } from './ComponentFactory';

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

  $$ = this.selectAll.bind(this) as <T extends Component>(
    constructor: ComponentConstructor<T>,
    satisfying?: SatisfyingFunction<T>
  ) => AsyncIterableIterator<T>;

  selectUnique<T extends Component>(
    constructor: ComponentConstructor<T>,
    satisfying?: SatisfyingFunction<T>
  ) {
    const factory = new ComponentFactory<T>(this, constructor);
    return factory.selectUnique(satisfying);
  }

  $_ = this.selectUnique.bind(this) as <T extends Component>(
    constructor: ComponentConstructor<T>,
    satisfying?: SatisfyingFunction<T>
  ) => Promise<T | undefined>;

  selectFirst<T extends Component>(
    constructor: ComponentConstructor<T>,
    satisfying?: SatisfyingFunction<T>
  ) {
    const factory = new ComponentFactory<T>(this, constructor);
    return factory.selectFirst(satisfying);
  }

  $ = this.selectFirst.bind(this) as <T extends Component>(
    constructor: ComponentConstructor<T>,
    satisfying?: SatisfyingFunction<T>
  ) => Promise<T | undefined>;
}
