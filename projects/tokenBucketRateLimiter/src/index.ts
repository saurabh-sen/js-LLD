console.log("Hello from tokenBucketRateLimiter!");
import { TokenBucketRateLimiter } from "./tokenBucketRateLimiter";

let passed = 0;
let failed = 0;

function expect(actual: boolean, expected: boolean, label?: string) {
  const ok = actual === expected;

  if (ok) {
    passed++;
    console.log(`  ${label ?? ""} PASS`);
  } else {
    failed++;
    console.log(`  ${label ?? ""} FAIL (expected ${expected}, got ${actual})`);
  }
}

async function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

async function runTests() {
  // ----------------------------
  // Phase 1
  // ----------------------------

  console.log("PHASE 1 TESTS");

  console.log("\nTest 1: Basic Allow");

  let limiter = new TokenBucketRateLimiter(5, 5);

  expect(limiter.allowRequest("clientA"), true);
  expect(limiter.allowRequest("clientA"), true);
  expect(limiter.allowRequest("clientA"), true);

  console.log("\nTest 2: Reject When Bucket Empty");

  limiter = new TokenBucketRateLimiter(2, 1);

  expect(limiter.allowRequest("clientA"), true);
  expect(limiter.allowRequest("clientA"), true);
  expect(limiter.allowRequest("clientA"), false);

  console.log("\nTest 3: Refill After 1 Second");

  limiter = new TokenBucketRateLimiter(2, 2);

  expect(limiter.allowRequest("clientA"), true);
  expect(limiter.allowRequest("clientA"), true);
  expect(limiter.allowRequest("clientA"), false);

  await sleep(1100);

  expect(limiter.allowRequest("clientA"), true);

  console.log("\nTest 4: Multiple Clients Isolation");

  limiter = new TokenBucketRateLimiter(2, 1);

  expect(limiter.allowRequest("A"), true);
  expect(limiter.allowRequest("A"), true);
  expect(limiter.allowRequest("A"), false);

  expect(limiter.allowRequest("B"), true);
  expect(limiter.allowRequest("B"), true);
  expect(limiter.allowRequest("B"), false);

  console.log("\nTest 5: Burst Traffic");

  limiter = new TokenBucketRateLimiter(3, 1);

  expect(limiter.allowRequest("clientA"), true);
  expect(limiter.allowRequest("clientA"), true);
  expect(limiter.allowRequest("clientA"), true);
  expect(limiter.allowRequest("clientA"), false);

  console.log("\nTest 6: Capacity Refill Cap");

  limiter = new TokenBucketRateLimiter(3, 5);

  await sleep(2000);

  expect(limiter.allowRequest("clientA"), true);
  expect(limiter.allowRequest("clientA"), true);
  expect(limiter.allowRequest("clientA"), true);
  expect(limiter.allowRequest("clientA"), false);

  console.log("\nTest 7: Continuous Requests");

  limiter = new TokenBucketRateLimiter(2, 1);

  expect(limiter.allowRequest("clientA"), true);
  expect(limiter.allowRequest("clientA"), true);
  expect(limiter.allowRequest("clientA"), false);

  await sleep(1000);

  expect(limiter.allowRequest("clientA"), true);

  // ----------------------------
  // Phase 2
  // ----------------------------

  console.log("\n\nPHASE 2 TESTS");

  console.log("\nTest 8: Idle Then Burst");

  limiter = new TokenBucketRateLimiter(5, 2);

  await sleep(4000);

  expect(limiter.allowRequest("clientA"), true);
  expect(limiter.allowRequest("clientA"), true);
  expect(limiter.allowRequest("clientA"), true);
  expect(limiter.allowRequest("clientA"), true);
  expect(limiter.allowRequest("clientA"), true);
  expect(limiter.allowRequest("clientA"), false);

  console.log("\nTest 9: Fractional Refill Behavior");

  limiter = new TokenBucketRateLimiter(2, 2);

  expect(limiter.allowRequest("clientA"), true);
  expect(limiter.allowRequest("clientA"), true);
  expect(limiter.allowRequest("clientA"), false);

  await sleep(600);

  const allowedAfterPartial = limiter.allowRequest("clientA");

  console.log("  Partial refill request:", allowedAfterPartial);

  console.log("\nTest 10: Client Fairness");

  limiter = new TokenBucketRateLimiter(1, 1);

  expect(limiter.allowRequest("A"), true);
  expect(limiter.allowRequest("A"), false);

  expect(limiter.allowRequest("B"), true);
  expect(limiter.allowRequest("B"), false);

  console.log("\nTest 11: High Request Burst");

  limiter = new TokenBucketRateLimiter(10, 5);

  let allowed = 0;

  for (let i = 0; i < 50; i++) {
    if (limiter.allowRequest("clientA")) {
      allowed++;
    }
  }

  console.log("  Allowed during burst:", allowed);

  console.log("\nTest 12: Concurrent Requests Simulation");

  limiter = new TokenBucketRateLimiter(5, 1);

  const promises = [];

  for (let i = 0; i < 20; i++) {
    promises.push(
      Promise.resolve().then(() => limiter.allowRequest("clientA")),
    );
  }

  const results = await Promise.all(promises);

  const successCount = results.filter(Boolean).length;

  console.log("  Concurrent allowed:", successCount);

  console.log("\n--- Summary ---");

  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
}

runTests();
