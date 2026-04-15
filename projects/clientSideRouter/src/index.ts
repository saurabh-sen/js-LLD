import { TrieRouter as Router } from "./clientSideRouter";
console.log("Hello from clientSideRouter!");

function runTests() {
  console.log("Running Router Tests...\n");

  const router = new Router();

  // 1️⃣ Register and match static route
  let called1 = false;
  router.addRoute("/home", () => {
    called1 = true;
  });

  router.navigate("/home");

  console.assert(called1, "❌ Test 1 failed");
  console.log("✅ Test 1 passed");

  // 2️⃣ Dynamic route param extraction
  let userId: string | null = null;

  router.addRoute("/users/:id", (params: any) => {
    userId = params.id;
  });

  router.navigate("/users/42");

  console.assert(userId === "42", "❌ Test 2 failed");
  console.log("✅ Test 2 passed");

  // 3️⃣ Multiple params
  let result3: any = null;

  router.addRoute("/orders/:orderId/items/:itemId", (params: any) => {
    result3 = params;
  });

  router.navigate("/orders/100/items/55");
  console.assert(
    result3.orderId === "100" && result3.itemId === "55",
    "❌ Test 3 failed",
  );
  console.log("✅ Test 3 passed");

  // 4️⃣ Route precedence (static vs param)
  let routeHit = "";

  const router2 = new Router();

  router2.addRoute("/users/me", () => {
    routeHit = "me";
  });

  router2.addRoute("/users/:id", () => {
    routeHit = "id";
  });

  router2.navigate("/users/me");

  console.assert(routeHit === "me", "❌ Test 4 failed");
  console.log("✅ Test 4 passed");

  // 5️⃣ Unknown route → NotFound
  const router3 = new Router();

  let notFound = false;

  router3.setNotFound(() => {
    notFound = true;
  });

  router3.navigate("/unknown");

  console.assert(notFound, "❌ Test 5 failed");
  console.log("✅ Test 5 passed");

  // 6️⃣ Navigation updates route
  const router4 = new Router();

  let navHit = false;

  router4.addRoute("/settings", () => {
    navHit = true;
  });

  router4.navigate("/settings");

  console.assert(navHit, "❌ Test 6 failed");
  console.log("✅ Test 6 passed");

  // 7️⃣ Exact match should not match partial path
  const router5 = new Router();

  let triggered = false;

  router5.addRoute("/users", () => {
    triggered = true;
  });

  router5.navigate("/users/42");

  console.assert(triggered === false, "❌ Test 7 failed");
  console.log("✅ Test 7 passed");

  // 8️⃣ Multiple routes registered
  const router6 = new Router();

  let order: string[] = [];

  router6.addRoute("/a", () => order.push("a"));
  router6.addRoute("/b", () => order.push("b"));
  router6.addRoute("/c", () => order.push("c"));

  router6.navigate("/b");

  console.assert(order.join(",") === "b", "❌ Test 8 failed");
  console.log("✅ Test 8 passed");

  // 9️⃣ Param route should match correct path only
  const router7 = new Router();

  let paramResult = "";

  router7.addRoute("/products/:id", (params: any) => {
    paramResult = params.id;
  });

  router7.navigate("/products/abc123");

  console.assert(paramResult === "abc123", "❌ Test 9 failed");
  console.log("✅ Test 9 passed");

  console.log("\nAll tests executed.");
}

runTests();
