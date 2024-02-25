export class LRUMid<K, V> {
  #oldMaxSize: number;
  #youngMaxSize: number;

  #old: Map<K, V>;
  #young: Map<K, V>;

  constructor(maxSize: number) {
    this.#oldMaxSize = Math.floor((maxSize * 3) / 8);
    this.#youngMaxSize = maxSize - this.#oldMaxSize;
    this.#old = new Map();
    this.#young = new Map();
  }

  get(key: K): V | undefined {
    if (this.#young.has(key)) {
      const value = this.#young.get(key);
      // simulate LRU
      this.#young.delete(key);
      this.#young.set(key, value!);
      return value;
    }
    if (this.#old.has(key)) {
      const value = this.#old.get(key);
      // move to young
      this.#old.delete(key);
      this.#young.set(key, value!);
      if (this.#young.size > this.#youngMaxSize) {
        const { done, value: entry } = this.#young.entries().next();
        if (done || !entry) {
          throw new Error(`Young get consistency issue ${done} ${entry}`);
        }
        const [key, value] = entry;
        this.#young.delete(key);
        this.#old.set(key, value);
      }
      if (this.#old.size > this.#oldMaxSize) {
        const { done, value: key } = this.#old.keys().next();
        if (done || !key) {
          throw new Error(`Old get consistency issue ${done} ${key}`);
        }
        this.#old.delete(key);
      }
      return value;
    }
    return undefined;
  }

  set(key: K, value: V): void {
    if (this.#young.has(key)) {
      this.#young.set(key, value);
      return;
    }
    if (this.#old.has(key)) {
      this.#old.set(key, value);
      return;
    }
    this.#old.set(key, value);
    if (this.#old.size > this.#oldMaxSize) {
      const { done, value: key } = this.#old.keys().next();
      if (done || !key) {
        throw new Error(`Old set consistency issue ${done} ${key}`);
      }
      this.#old.delete(key);
    }
  }

  delete(key: K): void {
    this.#young.delete(key);
    this.#old.delete(key);
  }

  keys() {
    const young = this.#young.keys();
    const old = this.#old.keys();

    return {
      next() {
        const youngResult = young.next();
        if (youngResult.done) {
          return old.next();
        }
        return youngResult;
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }

  debug() {
    console.log(JSON.stringify(Array.from(this.#old.entries())));
    console.log(JSON.stringify(Array.from(this.#young.entries())));
  }
}
