export interface DisplayObjectConditionStrategy<T extends {}> {
  $getConditions(constructor: T): Promise<Array<Promise<any>>>;
}
