import { Context } from "./Context";
import { DEFAULT_WAIT_FOR_TIMEOUT } from "./index";
import { PageObjectConstructor } from "./PageObjectConstructor";

export class PageObjectFactory<T> {
  constructor(
    protected context: Context,
    protected _constructor: PageObjectConstructor<T>
  ) {}

  create() {
    return new this._constructor(this.context);
  }

  async waitFor(timeout?: number) {
    timeout = timeout || DEFAULT_WAIT_FOR_TIMEOUT;
    const page = this.context.page;
    if (this._constructor.$url) {
      await page.goto(this._constructor.$url, { timeout });
    }
    for (let component of this._constructor.$initialComponents) {
      await this.context.waitFor(component, timeout);
    }
    return this.create();
  }
}
