export interface IDisplayObjectFactory<T extends {}> {
  waitFor(
    constrctor: { new (...args: any[]): T },
    timeout?: number,
    ...args: any[]
  ): Promise<T>;
}
