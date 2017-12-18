import { IDisplayObject, IDisplayObjectConstructor } from "./DisplayObject";
import { IContext } from './Context';

export interface IUINode {
  $selector: string;
  $name?: string;
  $hasDescendants?: boolean;
}

type UINodePair = [string | undefined, IUINode];

export interface IComponent extends IUINode, IDisplayObject {
  $walkNodes(): IterableIterator<IUINode>;
  $findNodeByName(name: string): IUINode | undefined;
}

export interface IComponentConstructor<T extends IComponent> extends IDisplayObjectConstructor<T> {
}

class UIDefination {
  protected descendants = new Array<UINodePair>();
  
  constructor(protected context: IContext) {
  }

  getDescendants(): ReadonlyArray<UINodePair> {
    return this.descendants;
  }

  withDescendant<T extends IComponent>(selectorOrConstructor: string | IComponentConstructor<T>, name?: string) {
    if (typeof selectorOrConstructor === 'string') {
      this.descendants.push([name, {
        $selector: selectorOrConstructor,
        $name: name
      }]);
    } else {
      const node = this.context.container.get(selectorOrConstructor);
      this.descendants.push([name ? name : node.$name, node]);  // Re-configure property "name".
    }
    return this;
  }
}

export abstract class Component implements IComponent {
  protected abstract definition: UIDefination;
  private selector: string;
  private name?: string;

  constructor(protected context: IContext) {
  }

  get $selector() {
    return this.selector;
  }

  get $name() {
    return this.name;
  }

  get $hasDescendants() {
    return this.definition.getDescendants().length > 0;
  }

  protected $root(selector: string, name?: string) {
    this.selector = selector;
    this.name = name;
    return new UIDefination(this.context);
  }

  *$walkNodes(): IterableIterator<IUINode> {
    yield {
      $selector: this.$selector,
      $name: this.$name,
      $hasDescendants: this.$hasDescendants
    };
    for (let [name, node] of this.definition.getDescendants()) {
      if (node instanceof Component) {
        const iter = node.$walkNodes();
        const result = iter.next();  // Skip real component itself, yield node below instead.
        yield {
          $selector: node.$selector,
          $name: name,  // Property "name" may be re-configured if component is generic.
          $hasDescendants: node.$hasDescendants
        };
        yield *iter;
      } else {
        yield {
          $selector: node.$selector,
          $name: node.$name,
          $hasDescendants: node.$hasDescendants ? true : false
        }
      }
    }
  }

  $findNodeByName(name: string) {
    for (let node of this.$walkNodes()) {
      if (node.$name === name) {
        return node;
      }
    }
  }

  $waitFor = () => Promise.resolve();
}
