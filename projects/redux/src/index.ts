import { createStore, applyMiddleware } from "./redux";

/* ------------------------------------------------ */
/* 1️⃣ Basic reducer + dispatch */
/* ------------------------------------------------ */

(function basicDispatchTest() {
  const reducer = (state = { count: 0 }, action: any) => {
    switch (action.type) {
      case "INC":
        return { count: state.count + 1 };
      default:
        return state;
    }
  };

  const store = createStore(reducer);

  store.dispatch({ type: "INC" });

  console.assert(store.getState().count === 1, "❌ Basic dispatch failed");

  console.log("✅ Basic dispatch passed");
})();

/* ------------------------------------------------ */
/* 2️⃣ Subscribe + unsubscribe */
/* ------------------------------------------------ */

(function subscriptionTest() {
  const reducer = (state = 0, action: any) =>
    action.type === "INC" ? state + 1 : state;

  const store = createStore(reducer);

  let called = 0;

  const unsubscribe = store.subscribe(() => {
    called++;
  });

  store.dispatch({ type: "INC" });

  unsubscribe();

  store.dispatch({ type: "INC" });

  console.assert(called === 1, "❌ Subscribe/unsubscribe failed");

  console.log("✅ Subscribe/unsubscribe passed");
})();

/* ------------------------------------------------ */
/* 3️⃣ Prevent dispatch inside reducer */
/* ------------------------------------------------ */

(function dispatchInReducerTest() {
  let store: any;

  const reducer = (state = 0, action: any) => {
    if (action.type === "INC") {
      store.dispatch({ type: "INC" });
    }
    return state + 1;
  };

  store = createStore(reducer);

  let errorCaught = false;

  try {
    store.dispatch({ type: "INC" });
  } catch {
    errorCaught = true;
  }

  console.assert(
    errorCaught === true,
    "❌ Dispatch inside reducer not blocked",
  );

  console.log("✅ Dispatch inside reducer blocked");
})();

/* ------------------------------------------------ */
/* 4️⃣ Middleware order test */
/* ------------------------------------------------ */

(function middlewareOrderTest() {
  const calls: string[] = [];

  const m1 = (store: any) => (next: any) => (action: any) => {
    calls.push("m1-before");
    const result = next(action);
    calls.push("m1-after");
    return result;
  };

  const m2 = (store: any) => (next: any) => (action: any) => {
    calls.push("m2-before");
    const result = next(action);
    calls.push("m2-after");
    return result;
  };

  const reducer = (state = 0, action: any) =>
    action.type === "INC" ? state + 1 : state;

  const store = createStore(reducer, undefined, applyMiddleware(m1, m2));

  store.dispatch({ type: "INC" });

  const expected = ["m1-before", "m2-before", "m2-after", "m1-after"];

  console.assert(
    JSON.stringify(calls) === JSON.stringify(expected),
    "❌ Middleware order incorrect",
  );

  console.log("✅ Middleware order correct");
})();

/* ------------------------------------------------ */
/* 5️⃣ Middleware modifying action */
/* ------------------------------------------------ */

(function middlewareModifyActionTest() {
  const modifier = (store: any) => (next: any) => (action: any) => {
    if (action.type === "INC") {
      action = { type: "INC", payload: 5 };
    }
    return next(action);
  };

  const reducer = (state = 0, action: any) =>
    action.type === "INC" ? state + (action.payload || 1) : state;

  const store = createStore(reducer, undefined, applyMiddleware(modifier));

  store.dispatch({ type: "INC" });

  console.assert(
    store.getState() === 5,
    "❌ Middleware action modification failed",
  );

  console.log("✅ Middleware modification passed");
})();

/* ------------------------------------------------ */
/* 6️⃣ Middleware dispatching another action */
/* ------------------------------------------------ */

(function middlewareDispatchTest() {
  const thunk = (store: any) => (next: any) => (action: any) => {
    if (typeof action === "function") {
      return action(store.dispatch, store.getState);
    }
    return next(action);
  };

  const reducer = (state = 0, action: any) =>
    action.type === "INC" ? state + 1 : state;

  const store = createStore(reducer, undefined, applyMiddleware(thunk));

  store.dispatch((dispatch: any) => {
    dispatch({ type: "INC" });
  });

  console.assert(
    store.getState() === 1,
    "❌ Middleware dispatch chaining failed",
  );

  console.log("✅ Middleware dispatch chaining passed");
})();

/* ------------------------------------------------ */
/* 7️⃣ Invalid action test */
/* ------------------------------------------------ */

(function invalidActionTest() {
  const reducer = (state = 0) => state;

  const store = createStore(reducer);

  let errorCaught = false;

  try {
    store.dispatch(null);
  } catch {
    errorCaught = true;
  }

  console.assert(errorCaught === true, "❌ Invalid action not rejected");

  console.log("✅ Invalid action rejected");
})();
