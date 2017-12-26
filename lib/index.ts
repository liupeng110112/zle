import { test as ava_test, RegisterContextual } from 'ava';
import { IContext } from './Context';

export const test: RegisterContextual<IContext> = ava_test;
