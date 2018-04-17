import { ComponentConstructor } from "./ComponentConstructor";
import { Context } from "./Context";

export interface PageConstructor<T> {
  $kind: "Page";
  $initialComponents: Array<ComponentConstructor<any>>;
  $url?: string;
  new ($context: Context): T;
}
