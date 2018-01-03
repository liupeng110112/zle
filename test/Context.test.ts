import { getExecutablePath, getPageUrl } from "./helpers";
import { test } from "../lib/index";
import { Post } from "./assets/post.components";
import { ContextFactory } from "../lib/ContextFactory";

test.beforeEach(async t => {
  const factory = new ContextFactory();
  t.context = await factory.$create({
    executablePath: getExecutablePath()
  });
});

test.afterEach.always(async t => {
  await t.context.$getBrowser().close();
});

test("#waitFor", async t => {
  const page = t.context.$getPage();
  await page.goto(getPageUrl("post"));
  const post = await t.context.$waitFor(Post, 1000);
  t.is(await post.$getSelector(), "html > body > div:nth-child(1)");
});
