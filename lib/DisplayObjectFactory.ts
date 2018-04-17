import { ComponentFactory } from "./ComponentFactory";
import { PageFactory } from "./PageFactory";

export type DisplayObjectFactory<T> = ComponentFactory<T> | PageFactory<T>;
