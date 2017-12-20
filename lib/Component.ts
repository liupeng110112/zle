import { IDisplayObject, IDisplayObjectConstructor } from "./DisplayObject";
import { IContext } from './Context';

export interface IUINode {
  readonly $selector: string;
  readonly $name?: string;
  readonly $hasDescendants?: boolean;
}

export interface IComponent extends IUINode, IDisplayObject {
  $walkNodes(): IterableIterator<IUINode>;
  $findNodeByName(name: string): IUINode | undefined;
  $overrideName(name: string): void;
}

export interface IComponentConstructor<T extends IComponent> extends IDisplayObjectConstructor<T> {
}

class UIDefination {
  protected descendants = new Array<IUINode>();
  
  constructor(protected context: IContext) {
  }

  getDescendants(): ReadonlyArray<IUINode> {
    return this.descendants;
  }

  withDescendant<T extends IComponent>(selectorOrConstructor: string | IComponentConstructor<T>, name?: string) {
    if (typeof selectorOrConstructor === 'string') {
      this.descendants.push({
        $selector: selectorOrConstructor,
        $name: name
      });
    } else {
      const node = new selectorOrConstructor(this.context);
      if (name) {
        node.$overrideName(name);
      }
      this.descendants.push(node);
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

  $overrideName(name: string) {
    this.name = name;
  }

  protected $root(selector: string, name?: string) {
    this.selector = selector;
    this.name = name;
    return new UIDefination(this.context);
  }

  *$walkNodes(): IterableIterator<IUINode> {
    yield this;
    for (let node of this.definition.getDescendants()) {
      if (node instanceof Component) {
        yield* node.$walkNodes();
      } else {
        yield node;
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
