import { EventEmitter } from "./eventBus";

function runTests() {
  console.log("Running EventEmitter Tests...\n");

  const bus = new EventEmitter();

  // 1️⃣ Single listener
  let count = 0;
  bus.on("a", () => count++);
  bus.emit("a");
  console.assert(count === 1, "❌ Test 1 failed");
  console.log("✅ Test 1 passed");

  // 2️⃣ FIFO same priority
  let order1: string[] = [];
  bus.on("b", () => order1.push("1"));
  bus.on("b", () => order1.push("2"));
  bus.on("b", () => order1.push("3"));
  bus.emit("b");
  console.assert(order1.join(",") === "1,2,3", "❌ Test 2 failed");
  console.log("✅ Test 2 passed");

  // 3️⃣ Priority ordering
  let order2: string[] = [];
  bus.on("c", () => order2.push("low"), 1);
  bus.on("c", () => order2.push("high"), 10);
  bus.on("c", () => order2.push("mid"), 5);
  bus.emit("c");
  console.assert(order2.join(",") === "high,mid,low", "❌ Test 3 failed");
  console.log("✅ Test 3 passed");

  // 4️⃣ Remove before emit
  const bus2 = new EventEmitter();
  let count2 = 0;
  const fnRemove = () => count2++;
  bus2.on("x", fnRemove);
  bus2.off("x", fnRemove);
  bus2.emit("x");
  console.assert(count2 === 0, "❌ Test 4 failed");
  console.log("✅ Test 4 passed");

  // 5️⃣ Remove during emit
  const bus3 = new EventEmitter();
  let order3: string[] = [];

  const fn2 = () => order3.push("should_not_run");

  const fn1 = () => {
    order3.push("first");
    bus3.off("y", fn2);
  };

  bus3.on("y", fn1, 10);
  bus3.on("y", fn2, 5);
  bus3.emit("y");

  console.assert(order3.join(",") === "first", "❌ Test 5 failed");
  console.log("✅ Test 5 passed");

  // 6️⃣ Stability same priority
  const bus4 = new EventEmitter();
  let order4: number[] = [];
  bus4.on("z", () => order4.push(1), 5);
  bus4.on("z", () => order4.push(2), 5);
  bus4.on("z", () => order4.push(3), 5);
  bus4.emit("z");

  console.assert(order4.join(",") === "1,2,3", "❌ Test 6 failed");
  console.log("✅ Test 6 passed");

  // 7️⃣ Error isolation
  const bus5 = new EventEmitter();
  let ran: boolean = false;
  bus5.on("e", () => {
    throw new Error("fail");
  });
  bus5.on("e", () => {
    ran = true;
  });
  bus5.emit("e");

  console.assert(ran, "❌ Test 7 failed");
  console.log("✅ Test 7 passed");

  console.log("\nAll tests executed.");
}

runTests();
