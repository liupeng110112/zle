import { IContext } from "./Context";

export interface IDisplayObject {
}

export interface IDisplayObjectConstructor<T extends IDisplayObject> {
  new($context: IContext, ...args: any[]): T;
  $waitFor(constructor: IDisplayObjectConstructor<T>, context: IContext, timeout?: number, ...args: any[]): Promise<T>;
};
