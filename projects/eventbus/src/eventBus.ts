interface IEvent {
  eventName: string;
  listener: Function;
  priority: number;
  order: number;
}

interface IEventBusItem {
  listeners: (IEvent | null)[];
  orderOfRegisteration: number;
}

export class EventEmitter {
  private eventBus = new Map<string, IEventBusItem>();
  constructor() {}

  // on : higher number means higher priority
  // params: eventName: string, listener: Function, priority?: number
  // return void
  public on(eventName: string, listener: Function, priority: number = 0) {
    // events exists
    if (this.eventBus.has(eventName)) {
      const eventItem = this.eventBus.get(eventName) as IEventBusItem;
      const newOrderOfRegisteration = eventItem.orderOfRegisteration + 1;
      const newListeners = [...eventItem.listeners];
      // push new listener
      newListeners.push({
        eventName,
        listener,
        priority,
        order: newOrderOfRegisteration,
      });

      // sort the listeners
      newListeners.sort((a, b) => {
        if (b == null || a == null) return 0;
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        return a.order - b.order;
      });

      // udpate the event item
      eventItem.listeners = newListeners;
      eventItem.orderOfRegisteration = newOrderOfRegisteration;

      // put the updated value in Map
      this.eventBus.set(eventName, eventItem);
    } else {
      const userEvent = {
        eventName,
        listener,
        priority,
        order: 0,
      };
      const newEvent = {
        listeners: [userEvent],
        orderOfRegisteration: 0,
      };
      this.eventBus.set(eventName, newEvent);
    }
  }

  // off : mark the index as null
  // params: eventName: string, listener: Function
  // return boolean
  public off(eventName: string, listener: Function) {
    if (this.eventBus.has(eventName)) {
      const eventItem = this.eventBus.get(eventName) as IEventBusItem;
      const eventItemListeners = eventItem.listeners;
      const orderOfRegisteration = eventItem.orderOfRegisteration;
      const index = eventItemListeners.findIndex(
        (value: IEvent | null, index: number, obj: (IEvent | null)[]) =>
          value?.listener === listener,
      );
      if (index !== -1) {
        eventItemListeners[index] = null;
      }
      // update the eventBus
      this.eventBus.set(eventName, {
        listeners: eventItemListeners,
        orderOfRegisteration,
      });
      return true;
    } else {
      return false;
    }
  }

  // emit
  // params: eventName: string, args: any
  // return void
  public emit(eventName: string, ...args: any) {
    if (this.eventBus.has(eventName)) {
      const eventItem = this.eventBus.get(eventName) as IEventBusItem;
      const eventItemListeners = eventItem.listeners;
      let emittedDepth = 0;
      // emittedDepth for checking if recursive calls are over
      eventItemListeners.forEach((event: IEvent | null) => {
        ++emittedDepth;
        if (event !== null) {
          try {
            event.listener(...args);
          } catch (er) {
            // monitor or logger
            console.log(
              "listener error",
              eventName,
              " for ",
              event.listener,
              "whole error",
              er,
            );
          }
        }
        --emittedDepth;
      });
      if (emittedDepth === 0) this.cleanupNullListeners(eventName);
    }
  }

  // params: eventName: string
  // return void
  private cleanupNullListeners(eventName: string) {
    if (this.eventBus.has(eventName)) {
      const eventItem = this.eventBus.get(eventName) as IEventBusItem;
      const eventItemListeners = eventItem.listeners;
      const orderOfRegisteration = eventItem.orderOfRegisteration;
      const newEventItemListeners = eventItemListeners.filter(
        (listener: IEvent | null) => listener !== null,
      );
      this.eventBus.set(eventName, {
        listeners: newEventItemListeners,
        orderOfRegisteration,
      });
    }
  }
}
