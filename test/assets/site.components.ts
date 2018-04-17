import { Component } from "../../lib/Component";
import { Page } from "../../lib/Page";
import { UIDefinition } from "../../lib/UIDefinition";

export class Header extends Component {
  static $definition = UIDefinition.root("header");
}

export class Nav extends Component {
  static $definition = UIDefinition.root("nav");
}

export class Main extends Component {
  static $definition = UIDefinition.root("main");
}

export class Footer extends Component {
  static $definition = UIDefinition.root("footer");
}

export class SitePage extends Page {
  static $initialComponents = [Header, Nav, Main, Footer];
}
