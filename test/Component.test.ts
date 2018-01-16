import { CommentItem, Post } from "./assets/post.components";
import { ContextFactory } from "../lib/ContextFactory";
import { Gate, Zoo } from "./assets/zoo.components";
import { getExecutablePath, getPageUrl } from "./";
import { HoverTransitionRect, InitTransitionRect } from "./assets/rect.components";
import { test } from "../lib/index";
import { TodoApp } from "./assets/todo.components";

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
  const todoApp = await t.context.waitFor(TodoApp);
  await todoApp.$type("input field", "todo#$type");
  const inputField = await todoApp.$getElementHandleByName("input field");
  const valueHandle = await inputField.getProperty("value");
  const value = await valueHandle.jsonValue();
  t.is(value, "todo#$type");
});

test("#$click", async t => {
  const page = t.context.page;
  await page.goto(getPageUrl("todo"));
  const todoApp = await t.context.waitFor(TodoApp);
  await todoApp.$type("input field", "todo#$type");
  await todoApp.$click("submit button");
  const html = await todoApp.$htmlOf("todo-list");
  t.not(html.indexOf("todo#$type"), -1);
});

test("#$press", async t => {
  const page = t.context.page;
  await page.goto(getPageUrl("todo"));
  const todoApp = await t.context.waitFor(TodoApp);
  await todoApp.$type("input field", "todo#$type");
  await todoApp.$press("input field", "Enter");
  const html = await todoApp.$htmlOf("todo-list");
  t.not(html.indexOf("todo#$type"), -1);
});

test("#$hover", async t => {
  const page = t.context.page;
  await page.goto(getPageUrl("rect"));
  const rect = await t.context.waitFor(HoverTransitionRect);
  const done = t.context.page.evaluate((el: HTMLElement) => {
    return new Promise((resolve, _) => {
      el.addEventListener("transitionend", () => {
        resolve();
      });
    });
  }, rect.$elementHandle);
  await rect.$hover("rect");
  await done;
  t.pass();
});

test("UIDefinition's satisfying", async t => {
  const page = t.context.page;
  await page.goto(getPageUrl("rect"));
  await t.context.waitFor(InitTransitionRect);
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
  const comment = await post.$_(
    CommentItem,
    async comment => (await comment.getContent()) === "3#comment 2"
  );
  t.is(await comment!.getContent(), "3#comment 2");
});

test("#$_ with not unique component", async t => {
  const page = t.context.page;
  await page.goto(getPageUrl("post"));
  const post = (await t.context.$(
    Post,
    async post => (await post.getTitle()) === "Post 3"
  ))!;
  try {
    await post.$_(CommentItem);
  } catch (err) {
    if (err instanceof Error) {
      t.is(
        err.message,
        'Component "CommentItem" is not unique by selector "html > body > div:nth-child(3) li.comment"'
      );
    }
  }
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

test("#$inspect", async t => {
  t.plan(5);
  const page = t.context.page;
  await page.goto(getPageUrl("zoo"));
  const zoo = await t.context.waitFor(Zoo);
  const end = await zoo
    .gotoGate()
    .gotoTigerHouse()
    .$inspect(async self => {
      t.is(await self.has(), "Tiger");
    })
    .gotoMonkeyHouse()
    .$inspect(async self => {
      t.is(await self.has(), "Monkey");
    })
    .gotoPandaHouse()
    .$inspect(async self => {
      t.is(await self.has(), "Panda");
    })
    .gotoGiraffeHouse()
    .$inspect(async self => {
      t.is(await self.has(), "Giraffe");
    })
    .gotoGate()
    .$done();
  t.truthy(end instanceof Gate);
});
