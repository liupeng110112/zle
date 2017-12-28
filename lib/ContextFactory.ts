import { IAsyncFactory } from "./Factories";
import { Context } from "./Context";
import { launch, LaunchOptions } from "puppeteer";

export class ContextFactory implements IAsyncFactory<Context> {
  async $create(options?: LaunchOptions) {
    const browser = await launch(options);
    const page = await browser.newPage();
    page.on("console", msg => {
      console.log(`>>> [${msg.type}] ${msg.text}`);
    });
    return new Context(browser, page);
  }
}
