import { createStore } from "./zustand";

let passed = 0;
let failed = 0;

function summary() {
  console.log("\n--- TEST SUMMARY ---");
  console.log("Passed:", passed);
  console.log("Failed:", failed);
  console.log("Total :", passed + failed);
}

async function runTests() {
  console.log("running test");

  async function test(name: string, fn: () => Promise<void> | void) {
    try {
      await fn();
      console.log("✓", name);
      passed++;
    } catch (err) {
      console.error("✗", name);
      console.error("   ", (err as Error).message);
      failed++;
    }
  }

  function assert(condition: boolean, message?: string) {
    if (!condition) throw new Error(message || "Assertion failed");
  }

  const flush = () => Promise.resolve();

  /* =========================================================
     TESTS
  ========================================================= */

  await test("unsubscribe during notification does not break iteration", async () => {
    const store = createStore<{ count: number }>(() => ({ count: 0 }));

    const calls: string[] = [];

    const unsubA = store.subscribe(() => {
      calls.push("A");
      unsubA();
    });

    store.subscribe(() => {
      calls.push("B");
    });

    store.setState({ count: 1 });
    await flush();

    assert(calls.length === 2);
    assert(calls.includes("A"));
    assert(calls.includes("B"));
  });

  await test("new subscriber added during notification runs on next update only", async () => {
    const store = createStore<{ count: number }>(() => ({ count: 0 }));

    let callCount = 0;

    store.subscribe(() => {
      store.subscribe(() => {
        callCount++;
      });
    });

    store.setState({ count: 1 });
    await flush();

    assert(callCount === 0);

    store.setState({ count: 2 });
    await flush();

    assert(callCount === 1);
  });

  await test("does not notify if value is unchanged", async () => {
    const store = createStore<{ count: number }>(() => ({ count: 5 }));

    let calls = 0;
    store.subscribe(() => calls++);

    store.setState({ count: 5 });
    await flush();

    assert(calls === 0);
  });

  await test("functional updates apply sequentially", async () => {
    const store = createStore<{ count: number }>(() => ({ count: 0 }));

    store.setState((s) => ({ count: s.count + 1 }));
    store.setState((s) => ({ count: s.count + 1 }));

    assert(store.getState().count === 2);
  });

  await test("listeners execute in insertion order", async () => {
    const store = createStore<{ value: number }>(() => ({ value: 0 }));

    const order: number[] = [];

    store.subscribe(() => order.push(1));
    store.subscribe(() => order.push(2));
    store.subscribe(() => order.push(3));

    store.setState({ value: 1 });
    await flush();

    assert(order.join(",") === "1,2,3");
  });

  await test("nested setState resolves correctly", async () => {
    const store = createStore<{ count: number }>(() => ({ count: 0 }));

    store.subscribe((state) => {
      if (state.count === 1) {
        store.setState({ count: 2 });
      }
    });

    store.setState({ count: 1 });
    await flush();

    assert(store.getState().count === 2);
  });

  await test("state reference remains stable for no-op update", async () => {
    const store = createStore<{ count: number }>(() => ({ count: 1 }));

    const prevRef = store.getState();
    store.setState({ count: 1 });
    await flush();
    const nextRef = store.getState();

    assert(prevRef === nextRef);
  });

  await test("multiple stores remain isolated", async () => {
    const storeA = createStore<{ value: number }>(() => ({ value: 1 }));
    const storeB = createStore<{ value: number }>(() => ({ value: 100 }));

    storeA.setState({ value: 2 });
    await flush();

    assert(storeA.getState().value === 2);
    assert(storeB.getState().value === 100);
  });

  await test("error in one listener does not stop others", async () => {
    const store = createStore<{ count: number }>(() => ({ count: 0 }));

    let secondCalled = false;

    store.subscribe(() => {
      throw new Error("Listener failure");
    });

    store.subscribe(() => {
      secondCalled = true;
    });

    store.setState({ count: 1 });
    await flush();

    assert(secondCalled);
  });

  await test("handles large subscriber count efficiently", async () => {
    const store = createStore<{ value: number }>(() => ({ value: 0 }));

    const N = 1000;
    let calls = 0;

    for (let i = 0; i < N; i++) {
      store.subscribe(() => calls++);
    }

    store.setState({ value: 1 });
    await flush();

    assert(calls === N);
  });

  summary();
}

runTests();
