export interface IDisplayObjectFactory<T extends {}> {
  waitFor(timeout?: number, ...args: any[]): Promise<T>;
}
