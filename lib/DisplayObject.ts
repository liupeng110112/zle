import { IContext } from "./Context";

export interface IDisplayObject {
}

export interface IDisplayObjectConstructor<T extends IDisplayObject> {
  waitFor(context: IContext, constructor: IDisplayObjectConstructor<T>, timeout?: number): Promise<T>;
};
