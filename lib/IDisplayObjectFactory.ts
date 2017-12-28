export interface IDisplayObjectFactory<T extends {}> {
  $waitFor(constrctor: { new (...args: any[]): T }, ...args: any[]): Promise<T>;
}
