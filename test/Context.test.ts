import { ContextFactory } from '../lib/ContextFactory';
import { getExecutablePath, getPageUrl } from './helpers';
import { Post } from './assets/post.components';
import { SitePage } from './assets/site.components';
import { test } from '../lib/index';
import { TodoApp } from './assets/todo.components';

test.beforeEach(async t => {
  const factory = new ContextFactory();
  t.context = await factory.create({
    executablePath: getExecutablePath()
  });
});

test.afterEach.always(async t => {
  await t.context.browser.close();
});

test("#waitFor with component", async t => {
  const page = t.context.page;
  await page.goto(getPageUrl("post"));
  const post = await t.context.waitFor(Post);
  t.is(await post.$getSelector(), "html > body > div:nth-child(1)");
});

test("#waitFor with page object", async t => {
  await t.context.page.goto(getPageUrl("site"));
  const page = await t.context.waitFor(SitePage);
  t.truthy(page instanceof SitePage);
});

test("#$$", async t => {
  const page = t.context.page;
  await page.goto(getPageUrl("post"));
  const posts = [];
  let index = 0;
  for await (let post of t.context.$$(Post)) {
    t.is(await post.getTitle(), `Post ${++index}`);
    posts.push(post);
  }
  t.is(posts.length, 5);
});

test("#$$ with satisfying function", async t => {
  const page = t.context.page;
  await page.goto(getPageUrl("post"));
  const posts = [];
  for await (let post of t.context.$$(
    Post,
    async post => (await post.getTitle()) === "Post 3"
  )) {
    posts.push(post);
  }
  t.is(posts.length, 1);
  t.is(await posts[0].getTitle(), "Post 3");
});

test("#$_ with not unique component", async t => {
  const page = t.context.page;
  await page.goto(getPageUrl("post"));
  try {
    await t.context.$_(Post);
  } catch (err) {
    if (err instanceof Error) {
      t.is(
        err.message,
        'Component "Post" is not unique by selector "div.post"'
      );
    }
  }
});

test("#$_ with unique component", async t => {
  const page = t.context.page;
  await page.goto(getPageUrl("todo"));
  const todoApp = await t.context.$_(TodoApp);
  t.truthy(todoApp instanceof TodoApp);
});

test("#$_ with satisfying function", async t => {
  const page = t.context.page;
  await page.goto(getPageUrl("post"));
  const post = await t.context.$_(
    Post,
    async post => (await post.getTitle()) === "Post 3"
  );
  t.truthy(post instanceof Post);
  t.is(await post!.getTitle(), "Post 3");
});

test("#$", async t => {
  const page = t.context.page;
  await page.goto(getPageUrl("post"));
  const post = await t.context.$(Post);
  t.is(await post!.getTitle(), "Post 1");
});

test("#$ with not existed component", async t => {
  const page = t.context.page;
  await page.goto(getPageUrl("post"));
  t.is(await t.context.$(TodoApp), undefined);
});

test("#$ with satisfying component", async t => {
  const page = t.context.page;
  await page.goto(getPageUrl("post"));
  const post = await t.context.$(
    Post,
    async post => (await post.getTitle()) === "Post 3"
  );
  t.is(await post!.getTitle(), "Post 3");
});
