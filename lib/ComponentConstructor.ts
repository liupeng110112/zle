import { Context } from "./Context";
import { ElementHandle } from "puppeteer";
import { UIDefinition } from "./UIDefinition";

export interface ComponentConstructor<T> {
  $kind: "Component";
  $definition: UIDefinition;
  new ($context: Context, $elementHandle: ElementHandle): T;
}
