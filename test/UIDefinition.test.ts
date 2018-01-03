import { Post } from './assets/post.components';
import { test } from 'ava';
import { UINode } from '../lib/UIDefinition';

test("UIDefinition", t => {
  const definition = Post.$definition;

  const post = definition.findUINodeByName("post")!;
  t.deepEqual(post.selector, "");
  t.is(post.name, "post");
  t.truthy(post.hasDescendants);

  const header = definition.findUINodeByName("post header")!;
  t.deepEqual(header.selector, "header");
  t.is(header.name, "post header");
  t.truthy(header.hasDescendants);
  t.falsy(definition.findUINodeByName("general header"));

  const footer = definition.findUINodeByName("post footer")!;
  t.deepEqual(footer.selector, "footer");
  t.is(footer.name, "post footer");
  t.truthy(footer.hasDescendants);

  const commentList = definition.findUINodeByName("comments")!;
  t.deepEqual(commentList.selector, "footer div.comments ul");
  t.is(commentList.name, "comments");
  t.truthy(commentList.hasDescendants);

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
  t.is(nodes.length, expections.length);
  for (let i = 0; i < nodes.length; i++) {
    t.deepEqual(nodes[i].selector, expections[i].selector);
    t.is(nodes[i].name, expections[i].name);
    t.is(!!nodes[i].hasDescendants, expections[i].hasDescendants);
  }
});
