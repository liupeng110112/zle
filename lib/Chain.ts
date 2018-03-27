export type Chainable<T> = { [P in keyof T]: T[P] } & { $done(): Promise<T> };

export function chain<T>(entrypoint: () => Promise<T>) {
  const steps = new Array<[string, any[]]>();
  const timer = setTimeout(() => {
    console.error(
      'Did you forget to invoke "$done" at the end of method chaining?'
    );
    process.exit(1);
  }, process.env.ZLE_CHAINABLE_TIMEOUT || 10000);
  const chainable = new Proxy<Chainable<T>>({} as any, {
    get: (_, name: string) => {
      return (...args: any[]) => {
        if (name === "$done") {
          clearTimeout(timer);
          return (async () => {
            try {
              let value: any = await entrypoint();
              for (let [name, args] of steps) {
                value = value[name](...args);
                if (value.$done) {
                  value = await value.$done();
                }
              }
              return Promise.resolve(value);
            } catch (err) {
              return Promise.reject(err);
            }
          })();
        } else {
          steps.push([name, args]);
          return chainable;
        }
      };
    }
  });
  return chainable;
}
