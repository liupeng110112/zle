import { ComponentConstructor } from "./ComponentConstructor";
import { Context } from "./Context";

export abstract class Page {
  static $kind: "Page" = "Page";
  static $initialComponents: Array<ComponentConstructor<any>>;
  static $url?: string;

  constructor(public $context: Context) {}
}
