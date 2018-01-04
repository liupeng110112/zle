import { ComponentFactory } from './ComponentFactory';
import { PageObjectFactory } from './PageObjectFactory';

export type DisplayObjectFactory<T> =
  | ComponentFactory<T>
  | PageObjectFactory<T>;
