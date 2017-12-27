import { Context } from "../lib/Context";
import { getExecutablePath, getPageUrl } from "./helpers";
import { test } from "../lib/index";
import { Post } from "./assets/post.components";

test.beforeEach(async t => {
  t.context = await Context.initialize({
    executablePath: getExecutablePath()
  });
});

test.afterEach(async t => {
  await t.context.getBrowser().close();
});

test("#waitFor", async t => {
  const page = await t.context.getPage();
  await page.goto(getPageUrl("post"));
  const post = await t.context.waitFor(Post);
  t.is(post.$selector, "html > body > div:nth-child(1)");
});
