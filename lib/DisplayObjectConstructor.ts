import { ComponentConstructor } from "./ComponentConstructor";
import { PageConstructor } from "./PageConstructor";

export type DisplayObjectConstructor<T> =
  | ComponentConstructor<T>
  | PageConstructor<T>;
