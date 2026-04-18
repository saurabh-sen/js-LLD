class DoublyLinkedList {
  node: DoublyLinkedList | null = null;
  next: DoublyLinkedList | null = null;
  prev: DoublyLinkedList | null = null;
  val: string | null = null;
  constructor(data: string | null) {
    this.val = data;
  }
}

export class ModalManager {
  modalMap = new Map<string, DoublyLinkedList>();
  private modalHead: DoublyLinkedList | null = null;
  private activeModal = this.modalHead;

  constructor() {}

  open(name: string) {
    // create a LL node;
    // add the node to Map
    // update active modal
    const prevActiveModal = this.activeModal;
    const newNode = new DoublyLinkedList(name);
    if (prevActiveModal) {
      // add a new node to active modal since it represent the last node of DoublyLinkedList
      prevActiveModal.next = newNode;
      newNode.prev = prevActiveModal;
    } else {
      // there is no active modal means we are at the first position create a new node and udpate modalHead;
      this.modalHead = newNode;
    }
    this.modalMap.set(name, newNode);
    this.activeModal = newNode;
  }
  close() {
    if (this.activeModal) {
      const prevModal = this.activeModal.prev;
      const next = this.activeModal.next;
      if (prevModal) prevModal.next = next;
      if (next) next.prev = prevModal;

      if (this.activeModal?.val && this.modalMap.has(this.activeModal.val))
        this.modalMap.delete(this.activeModal.val);
      this.activeModal = prevModal;
    }
    return null;
  }
  getActive() {
    return this.activeModal?.val ?? null;
  }
  closeById(id: string) {
    const modal = this.modalMap.get(id);
    if (modal) {
      const prev = modal.prev;
      const next = modal.next;
      if (prev) {
        prev.next = next;
      } else {
        // we are at the first node
        this.modalHead = next;
      }
      if (next) next.prev = prev;
      this.modalMap.delete(id);
    }
  }
  getStack() {
    const result: string[] = [];
    // traverse the LL;
    let temp = this.modalHead;
    while (temp) {
      if (temp?.val) result.push(temp.val);
      temp = temp.next;
    }
    return result;
  }
}
