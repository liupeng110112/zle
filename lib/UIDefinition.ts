import { Component } from "./Component";
import { ComponentConstructor } from "./ComponentConstructor";

export type UISatisfyingFunction = (el: HTMLElement) => void;
export type UINode = {
  selector: string;
  name?: string;
  satisfying?: UISatisfyingFunction;
  hasDescendants?: boolean;
};

// [selector or constructor, name, satisfying function]
export type Descendant = [
  string | ComponentConstructor<any>,
  string | undefined,
  UISatisfyingFunction | undefined
];

export class UIDefinition {
  protected descendants = new Array<Descendant>();

  static root(
    selector: string,
    name?: string,
    satisfying?: UISatisfyingFunction
  ) {
    return new UIDefinition(selector, name, satisfying);
  }

  findUINode(name: string) {
    for (let node of this.walkUINodes()) {
      if (node.name === name) {
        return node;
      }
    }
    return undefined;
  }

  *walkUINodes(isDescendant?: boolean): IterableIterator<UINode> {
    yield {
      selector: isDescendant ? this.selector : "",
      name: this.name,
      hasDescendants: this.descendants.length > 0,
      satisfying: this.satisfying
    };
    for (let [selectorOrConstructor, name, satisfying] of this.descendants) {
      if (typeof selectorOrConstructor === "string") {
        yield {
          selector: isDescendant
            ? [this.selector, selectorOrConstructor].join(" ")
            : selectorOrConstructor,
          name,
          satisfying,
          hasDescendants: false
        };
      } else {
        const definition = selectorOrConstructor.$definition;
        const nodes = definition.walkUINodes(true);
        if (name) {
          const { selector, satisfying, hasDescendants } = nodes.next().value;
          yield {
            selector: isDescendant
              ? [this.selector, selector].join(" ")
              : selector,
            name,
            satisfying,
            hasDescendants
          };
        }
        for (let { selector, name, satisfying, hasDescendants } of nodes) {
          yield {
            selector: isDescendant
              ? [this.selector, selector].join(" ")
              : selector,
            name,
            satisfying,
            hasDescendants
          };
        }
      }
    }
  }

  withDescendant<T extends Component>(
    selectorOrConstructor: string | ComponentConstructor<T>,
    name?: string,
    satisfying?: UISatisfyingFunction
  ): UIDefinition {
    this.descendants.push([selectorOrConstructor, name, satisfying]);
    return this;
  }

  protected constructor(
    public selector: string,
    public name?: string,
    public satisfying?: UISatisfyingFunction
  ) {}
}
