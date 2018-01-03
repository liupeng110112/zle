import { UIDefinition } from "./UIDefinition";
import { Component } from "./Component";
import { ElementHandle } from "puppeteer";
import { Context } from "./Context";

export interface ComponentConstructor<T extends Component> {
  $definition: UIDefinition;
  new ($context: Context, $handle: ElementHandle): T;
}
