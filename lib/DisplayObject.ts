import { IContext } from "./Context";

export interface IDisplayObject {
  $waitFor(timeout: number): Promise<void>;
}

export interface IDisplayObjectConstructor<T extends IDisplayObject> {
  new(context: IContext, ...args: any[]): T;
};
