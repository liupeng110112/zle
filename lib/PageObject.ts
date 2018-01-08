import { ComponentConstructor } from "./ComponentConstructor";
import { Context } from "./Context";

export abstract class PageObject {
  static $kind: "PageObject" = "PageObject";
  static $initialComponents: Array<ComponentConstructor<any>>;
  static $url?: string;

  constructor(public $context: Context) {}
}
