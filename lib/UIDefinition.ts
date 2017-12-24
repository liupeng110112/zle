import { IComponentConstructor, IComponent } from './Component';
import { UIDefinitionNotFound } from './exceptions';

export type UINode = {
  locator: Array<string>;
  name?: string;
  hasDescendants?: boolean;
};

export interface IUIDefinition {
  findUINodeByName(name: string): UINode | undefined;
  walkUINodes(): IterableIterator<UINode>;
  withDescendant<T extends IComponent>(selectorOrConstructor: string | IComponentConstructor<T>, name?: string): IUIDefinition;
}

export class UIDefinition implements IUIDefinition {
  protected descendants = new Array<[string | undefined, string | IComponentConstructor<any>]>();

  protected constructor(protected selector: string, protected name?: string) {
  }

  findUINodeByName(name: string): UINode | undefined {
    for (let node of this.walkUINodes()) {
      if (node.name === name) {
        return node;
      }
    }
  }

  *walkUINodes(): IterableIterator<UINode> {
    yield {
      locator: [this.selector],
      name: this.name,
      hasDescendants: this.descendants.length > 0
    };
    for (let [name, selectorOrConstructor] of this.descendants) {
      if (typeof selectorOrConstructor === 'string') {
        yield {
          locator: [this.selector, selectorOrConstructor],
          name: name
        };
      } else {
        const definition = selectorOrConstructor.definition;
        const results = definition.walkUINodes();
        if (name) {
          const first = results.next().value;
          yield {
            locator: [this.selector, ...first.locator],
            name: name,
            hasDescendants: first.hasDescendants
          };
        }
        for (let node of results) {
          yield {
            locator: [this.selector, ...node.locator],
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
