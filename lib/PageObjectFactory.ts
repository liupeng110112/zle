import { Context } from './Context';
import { DEFAULT_WAIT_FOR_TIMEOUT } from './constants';
import { PageObjectConstructor } from './PageObjectConstructor';

export class PageObjectFactory<T> {
  constructor(
    protected context: Context,
    protected _constructor: PageObjectConstructor<T>,
    protected url?: string
  ) {}

  create() {
    return new this._constructor(this.context);
  }

  async waitFor(timeout?: number) {
    timeout = timeout || DEFAULT_WAIT_FOR_TIMEOUT;
    const url = this.url || this._constructor.$url;
    const page = this.context.page;
    await page.goto(url!, { timeout });
    for (let component of this._constructor.$initialComponents) {
      await this.context.waitFor(component, { timeout });
    }
    return this.create();
  }
}
