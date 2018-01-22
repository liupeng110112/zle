import { Browser, Page } from 'puppeteer';
import { Component } from './Component';
import { ComponentConstructor } from './ComponentConstructor';
import { ComponentFactory, SelectSatisfying } from './ComponentFactory';

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
