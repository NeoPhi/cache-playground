import { Cache } from "../src/caches.js";

export class ObjectAdapter<K extends string, V> implements Cache<K, V> {
  #data: { [key: string]: V } = {};

  get(key: K): V | undefined {
    return this.#data[key];
  }

  set(key: K, value: V): void {
    this.#data[key] = value;
  }

  delete(key: K): void {
    delete this.#data[key];
  }

  keys(): string[] {
    return Object.keys(this.#data);
  }

  clear(): void {
    this.#data = {};
  }
}
