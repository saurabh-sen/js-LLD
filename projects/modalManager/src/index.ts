console.log("Hello from modalManager!");
import { ModalManager } from "./modalManager";

console.log("Hello from ModalManager!");

function runTests() {
  console.log("Running Modal Manager Tests...\n");

  const manager = new ModalManager();

  // 1️⃣ Open modal and check active
  manager.open("A");

  console.assert(manager.getActive() === "A", "❌ Test 1 failed");
  console.log("✅ Test 1 passed");

  // 2️⃣ Stack order after multiple opens
  manager.open("B");
  manager.open("C");

  const stack2 = manager.getStack();

  console.assert(stack2.join(",") === "A,B,C", "❌ Test 2 failed");
  console.log("✅ Test 2 passed");

  // 3️⃣ Active modal should be top
  console.assert(manager.getActive() === "C", "❌ Test 3 failed");
  console.log("✅ Test 3 passed");

  // 4️⃣ Close top modal
  manager.close();

  console.assert(manager.getActive() === "B", "❌ Test 4 failed");
  console.log("✅ Test 4 passed");

  // 5️⃣ Close specific modal (not top)
  manager.closeById("A");

  const stack5 = manager.getStack();

  console.assert(stack5.join(",") === "B", "❌ Test 5 failed");
  console.log("✅ Test 5 passed");

  // 6️⃣ Open another modal after removals
  manager.open("D");

  console.assert(manager.getActive() === "D", "❌ Test 6 failed");
  console.log("✅ Test 6 passed");

  // 7️⃣ Close top again
  manager.close();

  console.assert(manager.getActive() === "B", "❌ Test 7 failed");
  console.log("✅ Test 7 passed");

  // 8️⃣ Close last modal
  manager.close();

  console.assert(manager.getActive() === null, "❌ Test 8 failed");
  console.log("✅ Test 8 passed");

  // 9️⃣ Closing non-existent modal should not break stack
  manager.open("X");
  manager.open("Y");

  manager.closeById("Z");

  const stack9 = manager.getStack();

  console.assert(stack9.join(",") === "X,Y", "❌ Test 9 failed");
  console.log("✅ Test 9 passed");

  console.log("\nAll tests executed.");
}

runTests();
