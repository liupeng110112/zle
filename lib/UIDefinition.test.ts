import { test } from 'ava';
import { UIDefinition, UINode } from './UIDefinition';
import { Component } from './Component';
import { UIDefinitionNotFound } from './exceptions';

test('UIDefinition', (t) => {
  class Nav extends Component {
    static definition = UIDefinition
                          .root('nav');
  }

  class Header extends Component {
    static definition = UIDefinition
                          .root('header', 'general header')
                          .withDescendant('h2', 'post title');
  }

  class CommentComposer extends Component {
    static definition = UIDefinition
                          .root('div.comment-composer', 'comment composer')
                          .withDescendant('input', 'comment input field');
  }

  class CommentList extends Component {
    static definition = UIDefinition
                          .root('div.comments ul');
  }

  class Footer extends Component {
    static definition = UIDefinition
                          .root('footer', 'post footer')
                          .withDescendant('span.author')
                          .withDescendant('span.publish-date', 'publish date')
                          .withDescendant(CommentComposer)
                          .withDescendant(CommentList, 'comments');
  }

  class Post extends Component {
    static definition = UIDefinition
                          .root('div.post', 'post')
                          .withDescendant(Nav)
                          .withDescendant(Header, 'post header')
                          .withDescendant(Footer);
  }

  const definition = Post.definition;

  const post = definition.findUINodeByName('post')!;
  t.deepEqual(post.locator, ['div.post'])
  t.is(post.name, 'post');
  t.truthy(post.hasDescendants);

  const header = definition.findUINodeByName('post header')!;
  t.deepEqual(header.locator, ['div.post', 'header']);
  t.is(header.name, 'post header');
  t.truthy(header.hasDescendants);
  t.falsy(definition.findUINodeByName('general header'));

  const footer = definition.findUINodeByName('post footer')!;
  t.deepEqual(footer.locator, ['div.post', 'footer']);
  t.is(footer.name, 'post footer');
  t.truthy(footer.hasDescendants);
  
  const commentList = definition.findUINodeByName('comments')!;
  t.deepEqual(commentList.locator, ['div.post', 'footer', 'div.comments ul']);
  t.is(commentList.name, 'comments');
  t.falsy(commentList.hasDescendants);

  const expections: Array<UINode> = [
    {
      locator: ['div.post'],
      name: 'post',
      hasDescendants: true
    },
    {
      locator: ['div.post', 'nav'],
      name: undefined,
      hasDescendants: false
    },
    {
      locator: ['div.post', 'header'],
      name: 'post header',
      hasDescendants: true
    },
    {
      locator: ['div.post', 'header', 'h2'],
      name: 'post title',
      hasDescendants: false
    },
    {
      locator: ['div.post', 'footer'],
      name: 'post footer',
      hasDescendants: true
    },
    {
      locator: ['div.post', 'footer', 'span.author'],
      name: undefined,
      hasDescendants: false
    },
    {
      locator: ['div.post', 'footer', 'span.publish-date'],
      name: 'publish date',
      hasDescendants: false
    },
    {
      locator: ['div.post', 'footer', 'div.comment-composer'],
      name: 'comment composer',
      hasDescendants: true
    },
    {
      locator: ['div.post', 'footer', 'div.comment-composer', 'input'],
      name: 'comment input field',
      hasDescendants: false
    },
    {
      locator: ['div.post', 'footer', 'div.comments ul'],
      name: 'comments',
      hasDescendants: false
    }
  ];
  const results = Array.from(definition.walkUINodes());
  t.is(results.length, expections.length);
  for (let i = 0; i < results.length; i++) {
    t.deepEqual(results[i].locator, expections[i].locator);
    t.is(results[i].name, expections[i].name);
    t.is(!!results[i].hasDescendants, expections[i].hasDescendants);
  }
});
