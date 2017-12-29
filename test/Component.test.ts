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

test("#$textOf", async t => {
  const page = await t.context.$getPage();
  await page.goto(getPageUrl("post"));
  const post = await t.context.$waitFor(Post);
  const title = await post.$textOf("post title");
  t.is(title, "Post 1");
});

test("#$htmlOf", async t => {
  const page = await t.context.$getPage();
  await page.goto(getPageUrl("post"));
  const post = await t.context.$waitFor(Post);
  const html = await post.$htmlOf("post header");
  t.is(html.trim(), "<h2>Post 1</h2>");
});
