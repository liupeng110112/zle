export interface DisplayObjectConditionStrategy<T extends {}> {
  $getConditions(constructor: T, ...args: any[]): Promise<Array<Promise<any>>>;
}
