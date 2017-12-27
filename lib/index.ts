import { test as ava_test, RegisterContextual } from "ava";
import { Context } from "./Context";

export const test: RegisterContextual<Context> = ava_test;
