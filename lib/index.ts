import * as fs from "fs";
import * as path from "path";
import { Context } from "./Context";
import { ContextFactory } from "./ContextFactory";
import { launch, LaunchOptions } from "puppeteer";

export const DEFAULT_WAIT_FOR_TIMEOUT = 30000;

let _context: Context | undefined;

export const context = new Proxy<Context>({} as any, {
  get: (_, key: any) => {
    if (_context) {
      return (_context as any)[key];
    } else {
      throw new Error("No context found, did you forget to initialize?");
    }
  }
});

export interface InitializeOptions extends LaunchOptions {
  reportDir?: string;
  screenshot?: boolean;
}

export function initialize(options: InitializeOptions = {}) {
  if (!options.executablePath) {
    options.executablePath =
      process.env.ZLE_EXECUTABLE_PATH ||
      (process.platform === "darwin" &&
        "/Applications/Chromium.app/Contents/MacOS/Chromium") ||
      (process.platform === "linux" && "/usr/bin/chromium-browser") ||
      undefined;
  }

  if (!options.reportDir) {
    options.reportDir = process.env.ZLE_REPORT_DIR || process.cwd();
  }

  suiteSetup(async function() {
    if (!fs.existsSync(options.reportDir!)) {
      fs.mkdirSync(options.reportDir!);
    }
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
      if (options.screenshot && this.currentTest.state === "failed") {
        await _context.page.screenshot({
          path: path.join(
            options.reportDir!,
            path.format({
              name: this.currentTest.fullTitle(),
              ext: ".png"
            })
          ),
          fullPage: true
        });
      }
      await _context.page.close();
      _context = undefined;
    }
  });
}

export { Component } from "./Component";
export { ComponentConstructor } from "./ComponentConstructor";
export { ComponentFactory } from "./ComponentFactory";
export { Context } from "./Context";
export { ContextFactory } from "./ContextFactory";
export { DisplayObjectConstructor } from "./DisplayObjectConstructor";
export { DisplayObjectFactory } from "./DisplayObjectFactory";
export { PageObject } from "./PageObject";
export { PageObjectConstructor } from "./PageObjectConstructor";
export { PageObjectFactory } from "./PageObjectFactory";
export { UIDefinition } from "./UIDefinition";
export { chain } from "./Chain";
