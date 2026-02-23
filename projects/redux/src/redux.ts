interface IMiddlewareParamStore<TState> {
  getState: () => TState;
  dispatch: (action: TDispatchAction) => any;
}

type TEnhancer<TState> = (
  store: IMiddlewareParamStore<TState>,
) => (action: TDispatchAction) => any;

type TDispatchAction = { type: string };

type TSubscribeListener = Function | null;

type TReducer<TState> = (state: TState, action: TDispatchAction) => TState;

type TDefaultState = Record<string, any>;

export const applyMiddleware = <TState>(
  ...middlewares: TMiddleware<TState>[]
) => {
  return (createStore: TCreateStore<TState>) => {
    return (reducer: TReducer<TState>, preloadedState?: TState) => {
      const store = createStore(reducer, preloadedState);
      const middlewareAPI = {
              getState: store.getState,
              dispatch: (action: TDispatchAction) => dispatch(action),
            };

            const chain = middlewares.map((mw) =>
              mw(middlewareAPI)
            );

            dispatch = chain.reduceRight(
              (next, mw) => mw(next),
              store.dispatch
            );
    };
  };
};

export const createStore = <TState = TDefaultState>(
  reducer: TReducer<TState>,
  preloadedState?: TState,
  enhancer?: TEnhancer<TState>,
) => {
  if (enhancer) {
    return enhancer<TState>(createStore)(reducer, preloadedState);
  }
  let isDispatching: boolean = false;
  let state = preloadedState ?? reducer(undefined, { type: "@@INIT" });
  let subscriptions: (TSubscribeListener | null)[] = [];

  const getState = (): TState => {
    return state;
  };

  const dispatch = (action: TDispatchAction) => {
    if (isDispatching) return throw new Error('cannot dispatch while 1 operation is incomplete');
    try {
      isDispatching = true;
      if (action) {
        state = reducer(state, action);
        // notify all subscriptions
        notify();
      }
    } catch (er) {
      console.log(er);
    } finally {
      isDispatching = false;
    }
  };

  const subscribe = (listener: TSubscribeListener) => {
    subscriptions.push(listener);
    const unSubscribeListener = () => {
      const index = subscriptions.findIndex(
        (value: TSubscribeListener) => value === listener,
      );
      if (index !== -1) {
        subscriptions[index] = null;
      }
    };
    return unSubscribeListener;
  };

  const notify = () => {
    const nonNullListeners: TSubscribeListener[] = [];
    for (const listener of subscriptions) {
      try {
        if (listener !== null) {
          nonNullListeners.push(listener);
          listener();
        }
      } catch (er) {
        console.log("Error in executing listeners", er);
      }
    }
    subscriptions = nonNullListeners;
  };

  return {
    getState,
    dispatch,
    subscribe,
  };
};
