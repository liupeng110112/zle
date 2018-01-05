import { Component } from '../../lib/Component';
import { UIDefinition } from '../../lib/UIDefinition';

export class InitTransitionRect extends Component {
  static $definition = UIDefinition.root("div.init-transition", "rect", el => {
    return new Promise((resolve, _) => {
      el.addEventListener("transitionend", () => {
        resolve();
      });
    });
  });
}

export class HoverTransitionRect extends Component {
  static $definition = UIDefinition.root("div.hover-transition", "rect");
}
