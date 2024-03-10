// Builds on concepts outlined in https://yomguithereal.github.io/posts/lru-cache
export class Sieve<K, V> {
  #maxSize;
  #size = 0;
  #headIndex = 0;
  #tailIndex = 0;
  #freeHeadIndex = 0;
  #freeTailIndex = 0;
  #freeIndex = 1;
  #nextIndexes: Uint32Array;
  #previousIndexes: Uint32Array;
  #keys: K[];
  #values: V[];
  #visited: Uint8Array;
  #map: Map<K, number>;
  #hand = 0;

  constructor(size: number) {
    this.#maxSize = size;
    // TODO: Dynamically determine based on size
    this.#nextIndexes = new Uint32Array(size + 1);
    this.#previousIndexes = new Uint32Array(size + 1);
    this.#visited = new Uint8Array(size + 1);
    this.#keys = new Array(size + 1);
    this.#values = new Array(size + 1);
    this.#map = new Map();
  }

  clear() {
    this.#size = 0;
    this.#headIndex = 0;
    this.#tailIndex = 0;
    this.#freeHeadIndex = 0;
    this.#freeTailIndex = 0;
    this.#freeIndex = 1;
    this.#nextIndexes = new Uint32Array(this.#maxSize + 1);
    this.#previousIndexes = new Uint32Array(this.#maxSize + 1);
    this.#visited = new Uint8Array(this.#maxSize + 1);
    this.#keys = new Array(this.#maxSize + 1);
    this.#values = new Array(this.#maxSize + 1);
    this.#map = new Map();
    this.#hand = 0;
  }

  get(key: K): V | undefined {
    const index = this.#map.get(key);
    if (index !== undefined) {
      this.#visited[index] = 1;
      return this.#values[index];
    }
    return undefined;
  }

  set(key: K, value: V) {
    let index = this.#map.get(key);
    if (index !== undefined) {
      this.#values[index] = value;
      // DR: leave the #visited state as-is
      return;
    }
    if (this.#size === this.#maxSize) {
      this.#evict();
    }
    index = this.#getHeadIndex();
    this.#values[index] = value;
    this.#keys[index] = key;
    this.#visited[index] = 0;
    this.#map.set(key, index);
  }

  keys() {
    return this.#map.keys();
  }

  delete(key: K) {
    let index = this.#map.get(key);
    if (index !== undefined) {
      this.#removeNode(index);
    }
  }

  #evict() {
    if (this.#hand === 0) {
      this.#hand = this.#tailIndex;
    }
    while (this.#visited[this.#hand] === 1) {
      this.#visited[this.#hand] = 0;
      this.#hand = this.#nextIndexes[this.#hand];
      if (this.#hand === 0) {
        this.#hand = this.#tailIndex;
      }
    }
    this.#removeNode(this.#hand);
  }

  #getHeadIndex(): number {
    const freeIndex = this.#getFree();
    if (this.#headIndex === 0) {
      this.#tailIndex = freeIndex;
    } else {
      this.#nextIndexes[this.#headIndex] = freeIndex;
      this.#previousIndexes[freeIndex] = this.#headIndex;
    }
    this.#headIndex = freeIndex;
    this.#size += 1;
    return freeIndex;
  }

  #removeNode(nodeIndex: number) {
    const nodeNextIndex = this.#nextIndexes[nodeIndex];
    const nodePreviousIndex = this.#previousIndexes[nodeIndex];
    // Removing the head of this list
    if (nodeNextIndex === 0) {
      this.#headIndex = nodePreviousIndex;
      this.#nextIndexes[nodePreviousIndex] = 0;
    } else if (nodePreviousIndex !== 0) {
      this.#nextIndexes[nodePreviousIndex] = nodeNextIndex;
    }
    if (nodePreviousIndex === 0) {
      this.#tailIndex = nodeNextIndex;
      this.#previousIndexes[nodeNextIndex] = 0;
    } else if (nodeNextIndex !== 0) {
      this.#previousIndexes[nodeNextIndex] = nodePreviousIndex;
    }
    if (this.#hand === nodeIndex) {
      this.#hand = nodeNextIndex;
    }
    this.#nextIndexes[nodeIndex] = 0;
    this.#previousIndexes[nodeIndex] = 0;
    (this.#values as any)[nodeIndex] = undefined;
    const key = this.#keys[nodeIndex];
    this.#map.delete(key);
    this.#size -= 1;
    this.#addToFree(nodeIndex);
  }

  #addToFree(freeIndex: number) {
    if (this.#freeHeadIndex === 0) {
      this.#freeTailIndex = freeIndex;
    } else {
      this.#nextIndexes[this.#freeHeadIndex] = freeIndex;
    }
    this.#freeHeadIndex = freeIndex;
  }

  #getFree(): number {
    if (this.#size === this.#maxSize) {
      throw new Error("List is full");
    }
    if (this.#freeIndex <= this.#maxSize) {
      this.#freeIndex += 1;
      return this.#freeIndex - 1;
    }
    const freeIndex = this.#freeTailIndex;
    this.#freeTailIndex = this.#nextIndexes[freeIndex];
    if (this.#freeTailIndex === 0) {
      this.#freeHeadIndex = 0;
    }
    return freeIndex;
  }
}
