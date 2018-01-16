export type Chainable<T> = {
  $done(): Promise<T>;
} & T;

export function chain<T>(bootstrap: () => Promise<T>) {
  const instructions = new Array<[string, any[]]>();
  const proxy = new Proxy(
    {},
    {
      get: (_, name: string) => {
        return (...args: any[]) => {
          if (name === "$done") {
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
