import { CommentItem, Post } from './assets/post.components';
import { ContextFactory } from '../lib/ContextFactory';
import { getExecutablePath, getPageUrl } from './helpers';
import { Rect } from './assets/rect.components';
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

test("#$textOf", async t => {
  const page = t.context.page;
  await page.goto(getPageUrl("post"));
  const post = await t.context.waitFor(Post);
  const title = await post.$textOf("post title");
  t.is(title, "Post 1");
});

test("#$htmlOf", async t => {
  const page = t.context.page;
  await page.goto(getPageUrl("post"));
  const post = await t.context.waitFor(Post);
  const html = await post.$htmlOf("post header");
  t.is(html.trim(), "<h2>Post 1</h2>");
});

test("#$type", async t => {
  const page = t.context.page;
  await page.goto(getPageUrl("todo"));
  const todoApp = await t.context.waitFor(TodoApp, 1000);
  await todoApp.$type("input field", "todo#$type");
  const inputField = await todoApp.$getElementHandleByName("input field");
  const valueHandle = await inputField.getProperty("value");
  const value = await valueHandle.jsonValue();
  t.is(value, "todo#$type");
});

test("#$click", async t => {
  const page = t.context.page;
  await page.goto(getPageUrl("todo"));
  const todoApp = await t.context.waitFor(TodoApp, 1000);
  await todoApp.$type("input field", "todo#$type");
  await todoApp.$click("submit button");
  const html = await todoApp.$htmlOf("todo-list");
  t.not(html.indexOf("todo#$type"), -1);
});

test("#$press", async t => {
  const page = t.context.page;
  await page.goto(getPageUrl("todo"));
  const todoApp = await t.context.waitFor(TodoApp, 1000);
  await todoApp.$type("input field", "todo#$type");
  await todoApp.$press("input field", "Enter");
  const html = await todoApp.$htmlOf("todo-list");
  t.not(html.indexOf("todo#$type"), -1);
});

test("UIDefinition's satisfying", async t => {
  const page = t.context.page;
  await page.goto(getPageUrl("rect"));
  await t.context.waitFor(Rect, 2000);
  t.pass();
});

test("#$$", async t => {
  const page = t.context.page;
  await page.goto(getPageUrl("post"));
  const post = await t.context.$(
    Post,
    async post => (await post.getTitle()) === "Post 3"
  );
  const comments = new Array<CommentItem>();
  let index = 1;
  for await (let comment of post!.$$(CommentItem)) {
    t.is(await comment.getContent(), `3#comment ${index++}`);
    comments.push(comment);
  }
  t.is(comments.length, 3);
});

test("#$_", async t => {
  const page = t.context.page;
  await page.goto(getPageUrl("post"));
  const post = (await t.context.$(
    Post,
    async post => (await post.getTitle()) === "Post 3"
  ))!;
  const comment = await post.$_(CommentItem);
  t.is(comment, undefined);
});

test("#$", async t => {
  const page = t.context.page;
  await page.goto(getPageUrl("post"));
  const post = (await t.context.$(
    Post,
    async post => (await post.getTitle()) === "Post 3"
  ))!;
  const comment = await post.$(CommentItem);
  t.is(await comment!.getContent(), "3#comment 1");
});
