import { ComponentConstructor } from "./ComponentConstructor";
import { Context } from "./Context";

export interface PageObjectConstructor<T> {
  $kind: "PageObject";
  $initialComponents: Array<ComponentConstructor<any>>;
  $url?: string;
  new ($context: Context): T;
}
