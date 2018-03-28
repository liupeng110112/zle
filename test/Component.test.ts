import * as assert from "assert";
import { CommentItem, Post } from "./assets/post.components";
import { context } from "../lib";
import { Gate, Zoo } from "./assets/zoo.components";
import { getPageUrl } from "./TestServer";
import { HoverTransitionRect, InitTransitionRect } from "./assets/rect.components";
import { TodoApp } from "./assets/todo.components";

suite("Component", () => {
  test("#$textOf", async () => {
    const page = context.page;
    await page.goto(getPageUrl("post"));
    const post = await context.waitFor(Post);
    const title = await post.$textOf("post title");
    assert.equal(title, "Post 1");
  });

  test("#$htmlOf", async () => {
    const page = context.page;
    await page.goto(getPageUrl("post"));
    const post = await context.waitFor(Post);
    const html = await post.$htmlOf("post header");
    assert.equal(html.trim(), "<h2>Post 2</h2>");
  });

  test("#$type", async () => {
    const page = context.page;
    await page.goto(getPageUrl("todo"));
    const todoApp = await context.waitFor(TodoApp);
    await todoApp.$type("input field", "todo#$type");
    const inputField = await todoApp.$getElementHandleByName("input field");
    const valueHandle = await inputField.getProperty("value");
    const value = await valueHandle.jsonValue();
    assert.equal(value, "todo#$type");
  });

  test("#$click", async () => {
    const page = context.page;
    await page.goto(getPageUrl("todo"));
    const todoApp = await context.waitFor(TodoApp);
    await todoApp.$type("input field", "todo#$type");
    await todoApp.$click("submit button");
    const html = await todoApp.$htmlOf("todo-list");
    assert.notEqual(html.indexOf("todo#$type"), -1);
  });

  test("#$press", async () => {
    const page = context.page;
    await page.goto(getPageUrl("todo"));
    const todoApp = await context.waitFor(TodoApp);
    await todoApp.$type("input field", "todo#$type");
    await todoApp.$press("input field", "Enter");
    const html = await todoApp.$htmlOf("todo-list");
    assert.notEqual(html.indexOf("todo#$type"), -1);
  });

  test("#$hover", async () => {
    const page = context.page;
    await page.goto(getPageUrl("rect"));
    const rect = await context.waitFor(HoverTransitionRect);
    const done = context.page.evaluate((el: HTMLElement) => {
      return new Promise((resolve, _) => {
        el.addEventListener("transitionend", () => {
          resolve();
        });
      });
    }, rect.$elementHandle);
    await rect.$hover("rect");
    await done;
  });

  test("UIDefinition's satisfying", async () => {
    const page = context.page;
    await page.goto(getPageUrl("rect"));
    await context.waitFor(InitTransitionRect);
  });

  test("#$$", async () => {
    const page = context.page;
    await page.goto(getPageUrl("post"));
    const post = await context.$(
      Post,
      async post => (await post.getTitle()) === "Post 3"
    );
    const comments = new Array<CommentItem>();
    let index = 1;
    for await (let comment of post!.$$(CommentItem)) {
      assert.equal(await comment.getContent(), `3#comment ${index++}`);
      comments.push(comment);
    }
    assert.equal(comments.length, 3);
  });

  test("#$_", async () => {
    const page = context.page;
    await page.goto(getPageUrl("post"));
    const post = (await context.$(
      Post,
      async post => (await post.getTitle()) === "Post 3"
    ))!;
    const comment = await post.$_(
      CommentItem,
      async comment => (await comment.getContent()) === "3#comment 2"
    );
    assert.equal(await comment!.getContent(), "3#comment 2");
  });

  test("#$_ with not unique component", async () => {
    const page = context.page;
    await page.goto(getPageUrl("post"));
    const post = (await context.$(
      Post,
      async post => (await post.getTitle()) === "Post 3"
    ))!;
    try {
      await post.$_(CommentItem);
    } catch (err) {
      if (err instanceof Error) {
        assert.equal(
          err.message,
          'Component "CommentItem" is not unique by selector "html > body > div:nth-child(3) li.comment"'
        );
      }
    }
  });

  test("#$", async () => {
    const page = context.page;
    await page.goto(getPageUrl("post"));
    const post = (await context.$(
      Post,
      async post => (await post.getTitle()) === "Post 3"
    ))!;
    const comment = await post.$(CommentItem);
    assert.equal(await comment!.getContent(), "3#comment 1");
  });

  test("#$inspect", async () => {
    const page = context.page;
    await page.goto(getPageUrl("zoo"));
    const zoo = await context.waitFor(Zoo);
    const end = await zoo
      .gotoGate()
      .gotoTigerHouse()
      .$inspect(async self => {
        assert.equal(await self.has(), "Tiger");
      })
      .gotoMonkeyHouse()
      .$inspect(async self => {
        assert.equal(await self.has(), "Monkey");
      })
      .gotoPandaHouse()
      .$inspect(async self => {
        assert.equal(await self.has(), "Panda");
      })
      .gotoGiraffeHouse()
      .$inspect(async self => {
        assert.equal(await self.has(), "Giraffe");
      })
      .gotoGate()
      .$done();
    assert.ok(end instanceof Gate);
  });

  test("#$waitFor", async () => {
    const page = context.page;
    await page.goto(getPageUrl("post"));
    const post = await context.selectFirst(Post, async post => {
      return (await post.getTitle()) == "Post 2";
    });
    const commentItem = await post!.$waitFor(CommentItem);
    assert.equal(await commentItem.getContent(), "2#comment 1");
  });
});
