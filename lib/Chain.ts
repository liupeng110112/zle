type Instruction = [string, any[]]; // [name, args]
type Chainable<T> = Promise<T> & T;

export function chain<T extends object>(entrypoint: () => Promise<T>) {
  const instructions = new Array<Instruction>();
  const thenHandler = async (
    onfulfilled?: (value: any) => any,
    onrejected?: (value: any) => any
  ) => {
    if (instructions.length) {
      try {
        let object: any = await entrypoint();
        for (let [name, args] of instructions) {
          object = await object[name](...args);
        }
        return Promise.resolve(object).then(onfulfilled, onrejected);
      } catch (err) {
        return Promise.reject(err).then(onfulfilled, onrejected);
      }
    } else {
      return entrypoint().then(onfulfilled, onrejected);
    }
  };
  const catchHandler = (onrejected?: (value: any) => any) => {
    return thenHandler(undefined, onrejected);
  };
  const proxy = new Proxy(
    {},
    {
      get: (_, name: string) => {
        return (...args: any[]) => {
          switch (name) {
            case "then": {
              return thenHandler(...args);
            }
            case "catch": {
              return catchHandler(...args);
            }
            default: {
              instructions.push([name, args]);
              return proxy;
            }
          }
        };
      }
    }
  );
  return proxy as Chainable<T>;
}
