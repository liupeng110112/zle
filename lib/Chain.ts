type Instruction = [string, any[]]; // [name, args]
type Chainable<T> = PromiseLike<T> & T;

export function chain<T extends object>(entrypoint: () => Promise<T>) {
  const instructions = new Array<Instruction>();
  const thenHandler = async (
    onfulfilled?: (value: any) => any,
    onrejected?: (value: any) => any
  ) => {
    if (instructions.length) {
      try {
        let intermediate: any = await entrypoint();
        for (let [name, args] of instructions) {
          intermediate = await intermediate[name](...args);
        }
        return Promise.resolve(intermediate).then(onfulfilled, onrejected);
      } catch (err) {
        return Promise.reject(err).then(onfulfilled, onrejected);
      }
    } else {
      return entrypoint().then(onfulfilled, onrejected);
    }
  };
  const proxy = new Proxy(
    {},
    {
      get: (_, name: string) => {
        return (...args: any[]) => {
          if (name === "then") {
            return thenHandler(...args);
          } else {
            instructions.push([name, args]);
            return proxy;
          }
        };
      }
    }
  );
  return proxy as Chainable<T>;
}
