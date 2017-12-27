import { ElementHandle } from "puppeteer";
import { Context } from "./Context";
import { UIDefinition } from "./UIDefinition";
import { getCSSPath } from "./helpers";

export type ComponentConstructor<T extends Component> = {
  $definition: UIDefinition;
  new ($context: Context, $handle: ElementHandle, $selector: string): T;
  $initialize<T extends Component>(
    constructor: ComponentConstructor<T>,
    context: Context,
    handle: ElementHandle
  ): Promise<T>;
};

export abstract class Component {
  static $definition: UIDefinition;

  $findUINodeByName(name: string) {}

  async $walkUINodes() {}

  static async $initialize<T extends Component>(
    constructor: ComponentConstructor<T>,
    context: Context,
    handle: ElementHandle
  ) {
    const selector = await getCSSPath(context, handle);
    return new constructor(context, handle, selector);
  }

  constructor(
    public $context: Context,
    public $handle: ElementHandle,
    public $selector: string
  ) {}

  protected getElementHandleByName(name: string) {}
}
