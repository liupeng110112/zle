import { Component } from '../../lib/Component';
import { UIDefinition } from '../../lib/UIDefinition';

export class Rect extends Component {
  static $definition = UIDefinition.root(
    "div.rect",
    "rect",
    (el: HTMLElement) => {
      return new Promise((resolve, _) => {
        el.addEventListener("transitionend", () => {
          resolve();
        });
      });
    }
  );
}
