import { Component } from "./Component";
import { ComponentConstructor } from "./ComponentConstructor";
import { ComponentFactory, SelectSatisfying } from "./ComponentFactory";
import { DisplayObjectConstructor } from "./DisplayObjectConstructor";
import { DisplayObjectFactory } from "./DisplayObjectFactory";
import { Page } from "puppeteer";
import { PageFactory } from "./PageFactory";

export class Context {
  container: any = {};

  constructor(public page: Page) {}

  waitFor<T>(
    constructor: DisplayObjectConstructor<T>,
    timeout?: number
  ): Promise<T> {
    let factory: DisplayObjectFactory<T>;
    if (constructor.$kind === "Component") {
      factory = new ComponentFactory(this, constructor);
    } else {
      factory = new PageFactory(this, constructor);
    }
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
