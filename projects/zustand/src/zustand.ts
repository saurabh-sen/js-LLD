import { IStore, IInitializer, TListener, TPartial } from "./types";

const MAX_TRANSITIONS = 1000;
export const createStore = <TState extends object>(
  initializer: IInitializer<TState>,
): IStore<TState> => {
  let state!: TState;
  const listenersDS = new Set<TListener<TState>>();
  let isProcessing: boolean = false;
  let pendingStateUpdateQueue: TPartial<TState>[] = [];
  // Batching
  let isScheduled = false;
  let batchStartState: TState | null = null;

  const _notify = (newState: TState, prevState: TState) => {
    const snapshot: TListener<TState>[] = [...listenersDS];
    for (const listener of snapshot) {
      try {
        listener(newState, prevState);
      } catch (er) {
        console.log("something er while executing listener", er);
      }
    }
  };

  const _applyStateUpdates = (partial: TPartial<TState>) => {
    const prevState = state;
    const partialState =
      typeof partial === "function" ? partial(prevState) : partial;
    let shouldUpdate = false;
    // partial is an object
    // check for empty and un-necessary state updates
    for (const key in partialState) {
      if (!(Object.hasOwn(state, key) && Object.hasOwn(partialState, key)))
        return;
      if (!Object.is(state[key], partialState[key])) {
        shouldUpdate = true;
        break;
      }
    }
    if (!shouldUpdate) return;
    state = { ...state, ...partialState };
  };

  const flushBatchNotify = () => {
    if (batchStartState !== null && batchStartState !== state) {
      _notify(state, batchStartState);
    }

    batchStartState = null;
    isScheduled = false;
  };

  const set = (partial: TPartial<TState>) => {
    pendingStateUpdateQueue.push(partial);
    if (isProcessing) {
      return;
    }
    isProcessing = true;
    let transitionCount = 0;
    // Capture batch start state only once per cycle
    if (batchStartState === null) {
      batchStartState = state;
    }
    while (pendingStateUpdateQueue.length > 0) {
      if (++transitionCount > MAX_TRANSITIONS) {
        isProcessing = false;
        throw new Error("Infinite update loop detected");
      }
      const pendingUpdate = pendingStateUpdateQueue.shift();
      if (pendingUpdate) _applyStateUpdates(pendingUpdate);
    }
    isProcessing = false;

    // Schedule notification once per tick
    if (!isScheduled) {
      isScheduled = true;
      queueMicrotask(flushBatchNotify);
    }
  };

  const get = () => {
    return state;
  };

  state = initializer(set, get);

  const getState = () => {
    return state;
  };

  const setState = set;

  const subscribe = (listener: TListener<TState>) => {
    listenersDS.add(listener);
    return () => {
      listenersDS.delete(listener);
    };
  };

  return {
    getState,
    setState,
    subscribe,
  };
};
