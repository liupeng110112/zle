import { IComponentConstructor, IComponent } from './Component';

export type UINode = {
  path: Array<string>;
  name?: string;
  hasDescendants?: boolean;
};

export interface IUIDefinition {
  selector: string;
  name?: string;

  findUINodeByName(name: string): UINode | undefined;
  walkUINodes(): IterableIterator<UINode>;
  withDescendant<T extends IComponent>(selectorOrConstructor: string | IComponentConstructor<T>, name?: string): IUIDefinition;
}

export class UIDefinition implements IUIDefinition {
  protected descendants = new Array<[string | undefined, string | IComponentConstructor<any>]>();

  protected constructor(public selector: string, public name?: string) {
  }

  findUINodeByName(name: string): UINode | undefined {
    for (let node of this.walkUINodes()) {
      if (node.name === name) {
        return node;
      }
    }
    return undefined;
  }

  *walkUINodes(): IterableIterator<UINode> {
    yield {
      path: [this.selector],
      name: this.name,
      hasDescendants: this.descendants.length > 0
    };
    for (let [name, selectorOrConstructor] of this.descendants) {
      if (typeof selectorOrConstructor === 'string') {
        yield {
          path: [this.selector, selectorOrConstructor],
          name: name
        };
      } else {
        const definition = selectorOrConstructor.$definition;
        const results = definition.walkUINodes();
        if (name) {
          const first = results.next().value;
          yield {
            path: [this.selector, ...first.path],
            name: name,
            hasDescendants: first.hasDescendants
          };
        }
        for (let node of results) {
          yield {
            path: [this.selector, ...node.path],
            name: node.name,
            hasDescendants: node.hasDescendants
          };
        }
      }
    }
  }

  withDescendant<T extends IComponent>(selectorOrConstructor: string | IComponentConstructor<T>, name?: string): IUIDefinition {
    this.descendants.push([name, selectorOrConstructor]);
    return this;
  }

  static root(selector: string, name?: string) {
    return new UIDefinition(selector, name);
  }
}
