export interface IAsyncFactory<T> {
  $create(...args: any[]): Promise<T>;
}

export interface IDisplayObjectFactory<T extends {}> {
  $waitFor(constrctor: { new (...args: any[]): T }, ...args: any[]): Promise<T>;
}
