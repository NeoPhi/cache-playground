interface Node<T, U> {
  key: U;
  value: T;
  visited: boolean;
  prev?: Node<T, U>;
  next?: Node<T, U>;
}

// Modified from https://github.com/zweifisch/sieve/blob/ed6f771aba68aa53b63adc30cd5812bdae2563c8/mod.ts
export class SieveCache<T, U = string> {
  capacity: number;
  cache: Map<U, Node<T, U>> = new Map();
  head?: Node<T, U>;
  tail?: Node<T, U>;
  hand?: Node<T, U>;

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  private addToHead(node: Node<T, U>) {
    if (this.head) {
      node.next = this.head;
      this.head.prev = node;
    }
    this.head = node;
    if (this.tail === undefined) {
      this.tail = node;
    }
  }

  private removeNode(node: Node<T, U>) {
    if (node.prev) {
      node.prev.next = node.next;
      if (this.hand === node) {
        this.hand = node.prev;
      }
    } else {
      this.head = node.next;
    }
    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
  }

  private evict() {
    let node = this.hand || this.tail;
    while (node && node.visited) {
      node.visited = false;
      node = node.prev || this.tail;
    }
    if (node) {
      this.hand = node.prev;
      this.cache.delete(node.key);
      this.removeNode(node);
    }
  }

  keys() {
    return this.cache.keys();
  }

  delete(key: U) {
    throw new Error("delete not supported");
  }

  set(key: U, value: T) {
    if (this.cache.has(key)) {
      const node = this.cache.get(key)!;
      node.value = value;
      node.visited = true;
      return;
    }
    if (this.cache.size >= this.capacity) {
      this.evict();
    }
    const newNode = {
      key,
      value,
      visited: false,
    };
    this.addToHead(newNode);
    this.cache.set(key, newNode);
  }

  get(key: U) {
    if (this.cache.has(key)) {
      const node = this.cache.get(key)!;
      node.visited = true;
      return node.value;
    }
  }

  toString() {
    let ret = [];
    let current = this.head;
    while (current) {
      ret.push(
        `${this.hand === current ? ">" : " "} [${
          current.visited ? "X" : " "
        }] ${current.key}`
      );
      current = current.next;
    }
    return ret.join("\n");
  }
}
