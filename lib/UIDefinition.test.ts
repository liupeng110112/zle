import { test } from 'ava';
import { UIDefinition, UINode } from './UIDefinition';
import { Component } from './Component';
import { UIDefinitionNotFound } from './exceptions';

test('UIDefinition', (t) => {
  @UIDefinition
    .root('nav')
    .attach()
  class Nav extends Component {
  }

  @UIDefinition
    .root('header', 'general header')
    .withDescendant('h2', 'post title')
    .attach()
  class Header extends Component {
  }

  @UIDefinition
    .root('div.comment-composer', 'comment composer')
    .withDescendant('input', 'comment input field')
    .attach()
  class CommentComposer extends Component {
  }

  @UIDefinition
    .root('li')
    .attach()
  class CommentItem extends Component {
  }

  @UIDefinition
    .root('div.comments ul')
    .withDescendant(CommentItem)
    .attach()
  class CommentList extends Component {
  }

  @UIDefinition
    .root('footer', 'post footer')
    .withDescendant('span.author')
    .withDescendant('span.publish-date', 'publish date')
    .withDescendant(CommentComposer)
    .withDescendant(CommentList, 'comments')
    .attach()
  class Footer extends Component {
  }

  @UIDefinition
    .root('div.post', 'post')
    .withDescendant(Nav)
    .withDescendant(Header, 'post header')
    .withDescendant(Footer)
    .attach()
  class Post extends Component {
  }

  class App extends Component {
  }

  t.throws(() => UIDefinition.getDefinition(App), UIDefinitionNotFound);

  const definition = UIDefinition.getDefinition(Post);

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
  t.truthy(commentList.hasDescendants);

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
      hasDescendants: true
    },
    {
      locator: ['div.post', 'footer', 'div.comments ul', 'li'],
      name: undefined,
      hasDescendants: false
    },
  ];
  const results = Array.from(definition.walkUINodes());
  t.is(results.length, expections.length);
  for (let i = 0; i < results.length; i++) {
    t.deepEqual(results[i].locator, expections[i].locator);
    t.is(results[i].name, expections[i].name);
    t.is(!!results[i].hasDescendants, expections[i].hasDescendants);
  }
});
