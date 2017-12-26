import { test } from 'ava';
import { UINode } from '../lib/UIDefinition';
import { Post } from './assets/post.components';

test('UIDefinition', (t) => {
  const definition = Post.$definition;

  const post = definition.findUINodeByName('post')!;
  t.deepEqual(post.path, ['div.post'])
  t.is(post.name, 'post');
  t.truthy(post.hasDescendants);

  const header = definition.findUINodeByName('post header')!;
  t.deepEqual(header.path, ['div.post', 'header']);
  t.is(header.name, 'post header');
  t.truthy(header.hasDescendants);
  t.falsy(definition.findUINodeByName('general header'));

  const footer = definition.findUINodeByName('post footer')!;
  t.deepEqual(footer.path, ['div.post', 'footer']);
  t.is(footer.name, 'post footer');
  t.truthy(footer.hasDescendants);
  
  const commentList = definition.findUINodeByName('comments')!;
  t.deepEqual(commentList.path, ['div.post', 'footer', 'div.comments ul']);
  t.is(commentList.name, 'comments');
  t.falsy(commentList.hasDescendants);

  const expections: Array<UINode> = [
    {
      path: ['div.post'],
      name: 'post',
      hasDescendants: true
    },
    {
      path: ['div.post', 'nav'],
      name: undefined,
      hasDescendants: false
    },
    {
      path: ['div.post', 'header'],
      name: 'post header',
      hasDescendants: true
    },
    {
      path: ['div.post', 'header', 'h2'],
      name: 'post title',
      hasDescendants: false
    },
    {
      path: ['div.post', 'footer'],
      name: 'post footer',
      hasDescendants: true
    },
    {
      path: ['div.post', 'footer', 'span.author'],
      name: undefined,
      hasDescendants: false
    },
    {
      path: ['div.post', 'footer', 'span.publish-date'],
      name: 'publish date',
      hasDescendants: false
    },
    {
      path: ['div.post', 'footer', 'div.comment-composer'],
      name: 'comment composer',
      hasDescendants: true
    },
    {
      path: ['div.post', 'footer', 'div.comment-composer', 'input'],
      name: 'comment input field',
      hasDescendants: false
    },
    {
      path: ['div.post', 'footer', 'div.comments ul'],
      name: 'comments',
      hasDescendants: false
    }
  ];
  const nodes = Array.from(definition.walkUINodes());
  t.is(nodes.length, expections.length);
  for (let i = 0; i < nodes.length; i++) {
    t.deepEqual(nodes[i].path, expections[i].path);
    t.is(nodes[i].name, expections[i].name);
    t.is(!!nodes[i].hasDescendants, expections[i].hasDescendants);
  }
});
