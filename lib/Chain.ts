export type Chainable<T> = PromiseLike<T> & T;

export function chain<T extends object>(entrypoint: () => Promise<T>) {
  const instructions = new Array<[string, any[]]>();
  const thenHandler = async <TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: any) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null
  ): Promise<TResult1 | TResult2> => {
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
