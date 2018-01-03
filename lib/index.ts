import { Context } from './Context';
import { RegisterContextual, test as ava_test } from 'ava';

export const test: RegisterContextual<Context> = ava_test;
