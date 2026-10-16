// Which shop a request is for. The platform serves every shop from one process: the host name picks the
// shop, and everything that runs for that request (routes, database calls, timers started from it) sees
// that shop through AsyncLocalStorage. Shop code keeps importing `db` and `brand` as before; they are live
// views of the current shop.
import { AsyncLocalStorage } from 'node:async_hooks';

const als = new AsyncLocalStorage();

/** Runs fn with `shop` as the current shop: { slug, brand, db, uploadDir, record }. */
export const runAs = (shop, fn) => als.run(shop, fn);

export function currentShop() {
  const shop = als.getStore();
  if (!shop) throw new Error('No shop selected for this request');
  return shop;
}

/** A stand-in object that always reads through to pick()'s current value (for module-level constants). */
export function live(pick) {
  return new Proxy(
    {},
    {
      get(_, key) {
        const obj = pick();
        const value = Reflect.get(obj, key);
        return typeof value === 'function' ? value.bind(obj) : value;
      },
      set: (_, key, value) => Reflect.set(pick(), key, value),
      has: (_, key) => key in pick(),
      ownKeys: () => Reflect.ownKeys(pick()),
      getOwnPropertyDescriptor(_, key) {
        const d = Reflect.getOwnPropertyDescriptor(pick(), key);
        // The proxy's own target is empty, so report properties as configurable to satisfy proxy rules.
        return d && { ...d, configurable: true };
      },
    },
  );
}

export const brand = live(() => currentShop().brand);
