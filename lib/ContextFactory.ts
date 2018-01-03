import { Context } from "./Context";
import { launch, LaunchOptions } from "puppeteer";
import { IAsyncFactory } from "./IAsyncFactory";

export class ContextFactory implements IAsyncFactory<Context> {
  async $create(options?: LaunchOptions) {
    // Polyfill for "for await"
    // Reference: https://github.com/Microsoft/TypeScript/issues/14151
    // Reference: https://stackoverflow.com/questions/43694281/ts2318-cannot-find-global-type-asynciterableiterator-async-generator
    (<any>Symbol)["asyncIterator"] =
      Symbol.asyncIterator || Symbol.for("asyncIterator");
    // End of polyfill

    const browser = await launch(options);
    const page = await browser.newPage();
    page.on("console", msg => {
      console.log(`>>> [${msg.type}] ${msg.text}`);
    });
    return new Context(browser, page);
  }
}
