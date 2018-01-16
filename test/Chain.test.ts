import * as assert from "assert";
import { chain } from "../lib/Chain";
import { test } from "ava";

class Post {
  comments = new Array<string>();
  constructor(protected pageNumber: number) {}

  openComposer() {
    return chain(() => {
      return Promise.resolve(new CommentComposer(this));
    });
  }

  openPageNavigator() {
    return chain(() => {
      return Promise.resolve(new PageNavigator());
    });
  }

  assertPageNumber(pageNumber: number) {
    assert.equal(this.pageNumber, pageNumber);
    return this;
  }

  assertCommentExists(text: string) {
    assert.notEqual(this.comments.indexOf(text), -1);
    return this;
  }
}

class PageNavigator {
  goto(pageNumber: number) {
    return chain(() => {
      return Promise.resolve(new Post(pageNumber));
    });
  }
}

class CommentComposer {
  constructor(protected post: Post) {}

  compose(text: string) {
    return chain(() => {
      this.post.comments.push(text);
      return Promise.resolve(this.post);
    });
  }
}

test("chain", async t => {
  const post = new Post(1);
  await post
    .openComposer()
    .compose("say something here")
    .assertCommentExists("say something here")
    .openPageNavigator()
    .goto(5)
    .assertPageNumber(5)
    .openComposer()
    .compose("say something other here")
    .assertCommentExists("say something other here")
    .$done();
  t.pass();
});
