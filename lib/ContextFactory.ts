import { Browser } from "puppeteer";
import { Context } from "./Context";

export class ContextFactory {
  constructor(protected browser: Browser) {}
  async create() {
    // Polyfill for "for await"
    // Reference: https://github.com/Microsoft/TypeScript/issues/14151
    // Reference: https://stackoverflow.com/questions/43694281/ts2318-cannot-find-global-type-asynciterableiterator-async-generator
    (<any>Symbol)["asyncIterator"] =
      Symbol.asyncIterator || Symbol.for("asyncIterator");
    // End of polyfill

    const page = await this.browser.newPage();
    page.on("console", msg => {
      console.log(`>>> [${msg.type}] ${msg.text}`);
    });
    return new Context(page);
  }
}
