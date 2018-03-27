import * as assert from "assert";
import { Post } from "./assets/post.components";
import { UINode } from "../lib/UIDefinition";

test("UIDefinition can walk through the shape of ui", () => {
  const definition = Post.$definition;

  const post = definition.findUINode("post")!;
  assert.equal(post.selector, "");
  assert.equal(post.name, "post");
  assert.ok(post.hasDescendants);

  const header = definition.findUINode("post header")!;
  assert.equal(header.selector, "header");
  assert.equal(header.name, "post header");
  assert.ok(header.hasDescendants);
  assert.ok(!definition.findUINode("general header"));

  const footer = definition.findUINode("post footer")!;
  assert.equal(footer.selector, "footer");
  assert.equal(footer.name, "post footer");
  assert.ok(footer.hasDescendants);

  const commentList = definition.findUINode("comments")!;
  assert.equal(commentList.selector, "footer div.comments ul");
  assert.equal(commentList.name, "comments");
  assert.ok(commentList.hasDescendants);

  const expections: Array<UINode> = [
    {
      selector: "",
      name: "post",
      hasDescendants: true
    },
    {
      selector: "nav",
      name: undefined,
      hasDescendants: false
    },
    {
      selector: "header",
      name: "post header",
      hasDescendants: true
    },
    {
      selector: "header h2",
      name: "post title",
      hasDescendants: false
    },
    {
      selector: "footer",
      name: "post footer",
      hasDescendants: true
    },
    {
      selector: "footer span.author",
      name: undefined,
      hasDescendants: false
    },
    {
      selector: "footer span.publish-date",
      name: "publish date",
      hasDescendants: false
    },
    {
      selector: "footer div.comment-composer",
      name: "comment composer",
      hasDescendants: true
    },
    {
      selector: "footer div.comment-composer input",
      name: "comment input field",
      hasDescendants: false
    },
    {
      selector: "footer div.comments ul",
      name: "comments",
      hasDescendants: true
    },
    {
      selector: "footer div.comments ul li.comment",
      name: "comment",
      hasDescendants: false
    }
  ];
  const nodes = Array.from(definition.walkUINodes());
  assert.equal(nodes.length, expections.length);
  for (let i = 0; i < nodes.length; i++) {
    assert.equal(nodes[i].selector, expections[i].selector);
    assert.equal(nodes[i].name, expections[i].name);
    assert.equal(!!nodes[i].hasDescendants, expections[i].hasDescendants);
  }
});
