export interface IConditionStrategy<T extends {}> {
  $getConditions(constructor: T, ...args: any[]): Promise<Array<Promise<void>>>;
}
