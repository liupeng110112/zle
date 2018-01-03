export interface IAsyncFactory<T> {
  create(...args: any[]): Promise<T>;
}
