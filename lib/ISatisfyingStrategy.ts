export interface ISatisfyingStrategy<T extends {}> {
  getStrategy(constructor: T, ...args: any[]): Promise<Array<Promise<void>>>;
}
