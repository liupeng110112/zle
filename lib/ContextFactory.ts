import { Browser, launch, LaunchOptions } from "puppeteer";
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
  if (!options.executablePath) {
    options.executablePath =
      process.env.ZLE_EXECUTABLE_PATH ||
      (process.platform === "darwin" &&
        "/Applications/Chromium.app/Contents/MacOS/Chromium") ||
      (process.platform === "linux" && "/usr/bin/chromium-browser") ||
      undefined;
  }

  suiteSetup(async function() {
    this.browser = await launch(options);
  });

  suiteTeardown(async function() {
    if (this.browser) {
      await this.browser.close();
    }
  });

  setup(async function() {
    const factory = new ContextFactory(this.browser);
    const context = await factory.create();
    _context = context;
  });

  teardown(async function() {
    if (_context) {
      await _context.page.close();
      _context = undefined;
    }
  });
}
