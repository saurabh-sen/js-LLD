// LRU Cache Test Cases
import LRUCache from "./lruCache";

function getValue(cache: LRUCache, key: number): number {
  try {
    const node = cache.get(key);
    return node?.val?.value ?? -1;
  } catch {
    return -1;
  }
}

let passed = 0;
let failed = 0;

function expect(actual: number, expected: number, label?: string): void {
  const ok = actual === expected;
  if (ok) {
    passed++;
    console.log(`  ${label ? label + ": " : ""}PASS (got ${actual})`);
  } else {
    failed++;
    console.log(`  ${label ? label + ": " : ""}FAIL (expected ${expected}, got ${actual})`);
  }
}

function runTests() {
  console.log("Test 1: Basic Put/Get");

  let cache = new LRUCache(2);
  cache.put(1, 1);

  expect(getValue(cache, 1), 1);

  console.log("\nTest 2: LRU Eviction");

  cache = new LRUCache(2);
  cache.put(1, 1);
  cache.put(2, 2);

  cache.get(1); // 1 becomes MRU
  cache.put(3, 3);

  expect(getValue(cache, 2), -1);

  console.log("\nTest 3: Access Makes MRU");

  cache = new LRUCache(2);
  cache.put(1, 1);
  cache.put(2, 2);

  cache.get(1); // MRU
  cache.put(3, 3);

  expect(getValue(cache, 1), 1);
  expect(getValue(cache, 2), -1);
  expect(getValue(cache, 3), 3);

  console.log("\nTest 4: Overwrite Existing Key");

  cache = new LRUCache(2);

  cache.put(1, 1);
  cache.put(1, 10);

  expect(getValue(cache, 1), 10);

  console.log("\nTest 5: Capacity Edge Case");

  cache = new LRUCache(1);

  cache.put(1, 1);
  cache.put(2, 2);

  expect(getValue(cache, 1), -1);
  expect(getValue(cache, 2), 2);

  console.log("\nTest 6: Heavy Access Pattern");

  cache = new LRUCache(3);

  cache.put(1, 1);
  cache.put(2, 2);
  cache.put(3, 3);

  cache.get(1);
  cache.get(2);

  cache.put(4, 4);

  expect(getValue(cache, 3), -1);
  expect(getValue(cache, 1), 1);
  expect(getValue(cache, 2), 2);
  expect(getValue(cache, 4), 4);

  console.log("\n--- Summary ---");
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
}

runTests();
