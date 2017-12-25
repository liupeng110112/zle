import { UIDefinition } from "../../lib/UIDefinition";
import { Component } from "../../lib/Component";

export class Nav extends Component {
  static $definition = UIDefinition
    .root('nav');
}

export class Header extends Component {
  static $definition = UIDefinition
    .root('header', 'general header')
    .withDescendant('h2', 'post title');
}

export class CommentComposer extends Component {
  static $definition = UIDefinition
    .root('div.comment-composer', 'comment composer')
    .withDescendant('input', 'comment input field');
}

export class CommentList extends Component {
  static $definition = UIDefinition
    .root('div.comments ul');
}

export class Footer extends Component {
  static $definition = UIDefinition
    .root('footer', 'post footer')
    .withDescendant('span.author')
    .withDescendant('span.publish-date', 'publish date')
    .withDescendant(CommentComposer)
    .withDescendant(CommentList, 'comments');
}

export class Post extends Component {
  static $definition = UIDefinition
    .root('div.post', 'post')
    .withDescendant(Nav)
    .withDescendant(Header, 'post header')
    .withDescendant(Footer);
}