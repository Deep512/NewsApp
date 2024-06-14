export const sleep = (timeInSeconds: number) =>
  new Promise(resolve => setTimeout(() => resolve(1), timeInSeconds * 1000));
