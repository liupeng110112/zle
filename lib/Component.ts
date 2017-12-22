import { IDisplayObject, IDisplayObjectConstructor } from "./DisplayObject";

export interface IComponent extends IDisplayObject {
}

export interface IComponentConstructor<T extends IComponent> extends IDisplayObjectConstructor<T> {
  new(): T;
}

export abstract class Component implements IComponent {
}
