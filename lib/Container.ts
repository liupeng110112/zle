import { IContext } from './Context';
import { IDisplayObject, IDisplayObjectConstructor } from './DisplayObject';

export interface IContainer {
  get<T extends IDisplayObject>(constructor: IDisplayObjectConstructor<T>): T;
}

export class Container implements IContainer {
  protected pool = new Map<any, any>();

  constructor(protected context: IContext) {}

  get<T extends IDisplayObject>(constructor: IDisplayObjectConstructor<T>): T {
    const obj = this.pool.get(constructor);
    if (!obj) {
      const newObj = new constructor(this.context);
      this.pool.set(constructor, newObj);
      return newObj;
    }
    return obj;
  }
}
