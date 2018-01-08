import { ComponentConstructor } from "./ComponentConstructor";
import { PageObjectConstructor } from "./PageObjectConstructor";

export type DisplayObjectConstructor<T> =
  | ComponentConstructor<T>
  | PageObjectConstructor<T>;
