console.log("Hello from lruCache!");

interface IData {
  key: number;
  value: number;
}

class DllNode {
  public prev: DllNode | null = null;
  public next: DllNode | null = null;
  public val: IData | null = null;
  constructor(data: IData) {
    this.val = data;
  }
}

export default class LRUCache {
  private capacityMap: Map<number, DllNode>;
  private LruCacheCapacity: number;
  private head: DllNode;
  private tail: DllNode;
  constructor(capacity: number) {
    // gaurd;
    if (capacity < 1) throw "Cache must be greater than 1 in length";
    this.LruCacheCapacity = capacity;
    this.capacityMap = new Map<number, DllNode>();
    this.head = new DllNode({ key: -1, value: -1 });
    this.tail = new DllNode({ key: -1, value: -1 });
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  put(key: number, value: number) {
    const node = this.capacityMap.get(key);
    if(node){
      node.val!.value = value;
      this.moveToHead(node);
      return;
    }

    const newNode = new DllNode({ key, value });
    this.capacityMap.set(key, newNode);
    this.addToHead(newNode);
    if (this.capacityMap.size > this.LruCacheCapacity) {
      const tail = this.removeTail();
      this.capacityMap.delete(tail.val!.key);
    }
  }

  get(key: number) {
      const node = this.capacityMap.get(key);
      if (node) {
        this.moveToHead(node);
        return node.val!.value;
      }
      return -1;
  }

  private removeNode(node: DllNode) {
    node.next!.prev = node.prev;
    node.prev!.next = node.next;
  }

  private addToHead(node: DllNode) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next!.prev = node;
    this.head.next = node;
  }

  private moveToHead(node: DllNode) {
    this.removeNode(node);
    this.addToHead(node);
  }

  private removeTail(): DllNode {
    const node = this.tail.prev!;
    this.removeNode(node);
    return node;
  }
}
