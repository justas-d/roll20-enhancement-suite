export const promiseWait = <T>(timeMs: number, dataPassthrough?: T): Promise<T> => {
  return new Promise((ok, err) => {
    setTimeout(() => {
      ok(dataPassthrough);
    }, timeMs);
  })
};

