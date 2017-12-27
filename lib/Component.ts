import { ElementHandle } from "puppeteer";
import { Context } from "./Context";
import { UIDefinition } from "./UIDefinition";

export type ComponentConstructor<T extends Component> = {
  $definition: UIDefinition;
  new ($context: Context, $handle: ElementHandle): T;
};

export abstract class Component {
  static $definition: UIDefinition;

  constructor(protected $context: Context, protected $handle: ElementHandle) {}

  async $getCSSPath() {
    const page = this.$context.getPage();
    const path: string = await page.evaluate((el: HTMLElement) => {
      const segments = new Array<string>();
      let node = el;
      while (node) {
        const parent = node.parentElement!;
        if (parent) {
          const siblings = Array.from(parent.children).filter(el => {
            return el.localName === node.localName;
          });
          if (siblings.length > 1) {
            segments.push(
              `${node.localName}:nth-child(${siblings.indexOf(node) + 1})`
            );
          } else {
            segments.push(node.localName!); // only child
          }
        } else {
          segments.push(node.localName!); // met element 'html'
        }
        node = parent;
      }
      segments.reverse();
      return segments.join(" > ");
    }, this.$handle);
    return path;
  }
}
