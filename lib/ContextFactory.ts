import { Browser } from "puppeteer";
import { Context } from "./Context";

export class ContextFactory {
  constructor(protected browser: Browser) {
    // Polyfill for "for await"
    // Reference: https://github.com/Microsoft/TypeScript/issues/14151
    // Reference: https://stackoverflow.com/questions/43694281/ts2318-cannot-find-global-type-asynciterableiterator-async-generator
    (<any>Symbol)["asyncIterator"] =
      Symbol.asyncIterator || Symbol.for("asyncIterator");
    // End of polyfill
  }

  async create() {
    const page = await this.browser.newPage();
    return new Context(page);
  }
}
