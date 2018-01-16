import { Context } from "./Context";
import { RegisterContextual, test as ava_test } from "ava";

export { Component } from "./Component";
export { ComponentConstructor } from "./ComponentConstructor";
export { ComponentFactory } from "./ComponentFactory";
export { Context } from "./Context";
export { ContextFactory } from "./ContextFactory";
export { DisplayObjectConstructor } from "./DisplayObjectConstructor";
export { DisplayObjectFactory } from "./DisplayObjectFactory";
export { PageObject } from "./PageObject";
export { PageObjectConstructor } from "./PageObjectConstructor";
export { PageObjectFactory } from "./PageObjectFactory";
export { UIDefinition } from "./UIDefinition";
export { chain } from "./Chain";

export const DEFAULT_WAIT_FOR_TIMEOUT = 30000;
export const test: RegisterContextual<Context> = ava_test;
