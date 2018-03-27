import * as assert from "assert";
import { context, initialize } from "../lib/ContextFactory";
import { getPageUrl } from "./TestServer";
import { Post } from "./assets/post.components";
import { SitePage } from "./assets/site.components";
import { TodoApp } from "./assets/todo.components";

describe("Context", () => {
  initialize();

  it("#waitFor with component", async () => {
    const page = context.page;
    await page.goto(getPageUrl("post"));
    const post = await context.waitFor(Post);
    assert.equal(await post.$getSelector(), "html > body > div:nth-child(1)");
  });

  it("#waitFor with page object", async () => {
    await context.page.goto(getPageUrl("site"));
    const page = await context.waitFor(SitePage);
    assert.ok(page instanceof SitePage);
  });

  it("#$$", async () => {
    const page = context.page;
    await page.goto(getPageUrl("post"));
    const posts = [];
    let index = 0;
    for await (let post of context.$$(Post)) {
      assert.equal(await post.getTitle(), `Post ${++index}`);
      posts.push(post);
    }
    assert.equal(posts.length, 5);
  });

  it("#$$ with satisfying function", async () => {
    const page = context.page;
    await page.goto(getPageUrl("post"));
    const posts = [];
    for await (let post of context.$$(
      Post,
      async post => (await post.getTitle()) === "Post 3"
    )) {
      posts.push(post);
    }
    assert.equal(posts.length, 1);
    assert.equal(await posts[0].getTitle(), "Post 3");
  });

  it("#$_ with not unique component", async () => {
    const page = context.page;
    await page.goto(getPageUrl("post"));
    try {
      await context.$_(Post);
    } catch (err) {
      if (err instanceof Error) {
        assert.equal(
          err.message,
          'Component "Post" is not unique by selector "div.post"'
        );
      }
    }
  });

  it("#$_ with unique component", async () => {
    const page = context.page;
    await page.goto(getPageUrl("todo"));
    const todoApp = await context.$_(TodoApp);
    assert.ok(todoApp instanceof TodoApp);
  });

  it("#$_ with satisfying function", async () => {
    const page = context.page;
    await page.goto(getPageUrl("post"));
    const post = await context.$_(
      Post,
      async post => (await post.getTitle()) === "Post 3"
    );
    assert.ok(post instanceof Post);
    assert.equal(await post!.getTitle(), "Post 3");
  });

  it("#$", async () => {
    const page = context.page;
    await page.goto(getPageUrl("post"));
    const post = await context.$(Post);
    assert.equal(await post!.getTitle(), "Post 1");
  });

  it("#$ with not existed component", async () => {
    const page = context.page;
    await page.goto(getPageUrl("post"));
    assert.equal(await context.$(TodoApp), undefined);
  });

  it("#$ with satisfying component", async () => {
    const page = context.page;
    await page.goto(getPageUrl("post"));
    const post = await context.$(
      Post,
      async post => (await post.getTitle()) === "Post 3"
    );
    assert.equal(await post!.getTitle(), "Post 3");
  });
});
