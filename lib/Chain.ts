export type Chainable<T> = {
  $done(): Promise<T>;
} & T;

export function chain<T>(bootstrap: () => Promise<T>) {
  const instructions = new Array<[string, any[]]>();
  const semaphore = {
    isDone: false
  };
  setTimeout(() => {
    if (!semaphore.isDone) {
      console.error(
        `[Did you forget to invoke "$done" at the end of method chaining?]`
      );
      process.exit(1);
    }
  }, process.env.ZLE_WAIT_FOR_CHAIN_DONE_TIMEOUT || 10000);
  const proxy = new Proxy(
    {},
    {
      get: (_, name: string) => {
        return (...args: any[]) => {
          if (name === "$done") {
            semaphore.isDone = true;
            return (async () => {
              try {
                let intermediate: any = await bootstrap();
                for (let [name, args] of instructions) {
                  intermediate = intermediate[name](...args);
                  if (intermediate.$done) {
                    intermediate = await intermediate.$done();
                  }
                }
                return Promise.resolve(intermediate);
              } catch (err) {
                return Promise.reject(err);
              }
            })();
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
