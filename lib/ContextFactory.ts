import { Context } from "./Context";
import { launch, LaunchOptions } from "puppeteer";

export class ContextFactory {
  async create(options?: LaunchOptions) {
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

let _context: Context | undefined;

export const context = new Proxy<Context>({} as any, {
  get: (_, key: string) => {
    if (_context) {
      return (_context as any)[key];
    } else {
      throw new Error(
        "No context found, did you forget to invoke zle.initialize() in test file?"
      );
    }
  }
});

export function initialize(options: LaunchOptions = {}) {
  beforeEach(async () => {
    if (!options.executablePath) {
      options.executablePath =
        process.env.ZLE_EXECUTABLE_PATH ||
        (process.platform === "darwin" &&
          "/Applications/Chromium.app/Contents/MacOS/Chromium") ||
        (process.platform === "linux" && "/usr/bin/chromium-browser") ||
        undefined;
    }
    const factory = new ContextFactory();
    const context = await factory.create(options);
    _context = context;
  });

  afterEach(async () => {
    if (_context) {
      await _context.browser.close();
      _context = undefined;
    }
  });
}
