import { IContext, Context } from './Context';
import { IDisplayObject } from './DisplayObject';

describe('Container', () => {
  describe('#get', () => {
    class DisplayObjectA implements IDisplayObject {
      constructor(protected context: IContext) {}
      $waitFor = () => Promise.resolve();
    }

    class DisplayObjectB implements IDisplayObject {
      constructor(protected context: IContext) {}
      $waitFor = () => Promise.resolve();
    }

    test('can return the instance of class that passed in arguments', () => {
      const context = new Context();
      const objA = context.container.get(DisplayObjectA);
      expect(objA).toBeInstanceOf(DisplayObjectA);
      const objB = context.container.get(DisplayObjectB);
      expect(objB).toBeInstanceOf(DisplayObjectB);
    });

    test('can cache the instance of class that passed in arguments', () => {
      const context = new Context();
      const objA1 = context.container.get(DisplayObjectA);
      expect(objA1).toBeInstanceOf(DisplayObjectA);
      const objB1 = context.container.get(DisplayObjectB);
      expect(objB1).toBeInstanceOf(DisplayObjectB);
      const objA2 = context.container.get(DisplayObjectA);
      expect(objA2).toBe(objA1);
      const objB2 = context.container.get(DisplayObjectB);
      expect(objB2).toBe(objB2);
    });
  });
});
