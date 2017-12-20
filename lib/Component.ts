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
}

export interface IComponentConstructor<T extends IComponent> extends IDisplayObjectConstructor<T> {
  new(context: IContext, parent?: IComponent, name?: string): T;
}

class UIDefination {
  protected descendants = new Array<IUINode>();
  
  constructor(protected context: IContext, protected component: IComponent) {
  }

  getDescendants(): ReadonlyArray<IUINode> {
    return this.descendants;
  }

  withDescendant<T extends IComponent>(selectorOrConstructor: string | IComponentConstructor<T>, name?: string) {
    if (typeof selectorOrConstructor === 'string') {
      this.descendants.push({
        $selector: [this.component.$selector, selectorOrConstructor].join(' '),
        $name: name
      });
    } else {
      const node = new selectorOrConstructor(this.context, this.component, name);
      this.descendants.push(node);
    }
    return this;
  }
}

export abstract class Component implements IComponent {
  protected abstract definition: UIDefination;
  private selector: string;

  constructor(protected context: IContext, protected parent?: IComponent, protected name?: string) {
  }

  get $selector() {
    return this.parent ? [this.parent.$selector, this.selector].join(' ') : this.selector;
  }

  get $name() {
    return this.name;
  }

  get $hasDescendants() {
    return this.definition.getDescendants().length > 0;
  }

  protected $root(selector: string, name?: string) {
    this.selector = selector;
    if (!this.name) {
      this.name = name;
    }
    return new UIDefination(this.context, this);
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
