/**
 * StockFlow MVP – Full End-to-End Integration Test
 * Covers every acceptance criterion from the PRD demo checklist:
 *
 *  ✓ Signup, login, see dashboard
 *  ✓ Create product with SKU + quantity
 *  ✓ Product appears in list and dashboard summary
 *  ✓ Low-stock detection based on threshold
 *  ✓ Cross-tenant isolation (org A cannot see org B data)
 *  ✓ Stock adjustment (inline +/- N)
 *  ✓ Settings: default threshold used when product has none
 */

const URL = "http://localhost:4000/api";
const TS  = Date.now();

async function json(res) { return res.json(); }
async function req(path, opts = {}) {
  return fetch(`${URL}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
      ...(opts.headers || {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  }).then(json);
}

function assert(label, cond, detail = "") {
  if (!cond) {
    console.error(`  ❌ FAIL: ${label}  ${detail}`);
    process.exitCode = 1;
  } else {
    console.log(`  ✅ ${label}`);
  }
}

async function run() {
  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║   StockFlow MVP – Integration Test               ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  /* ─────────────────────────────────────────
   * 1. SIGNUP – Org A
   * ───────────────────────────────────────── */
  console.log("── 1. AUTH: Signup & Login ────────────────────────");
  const signupA = await req("/auth/signup", {
    method: "POST",
    body: { email: `a_${TS}@demo.com`, password: "password123", confirmPassword: "password123", organizationName: `OrgA_${TS}` },
  });
  assert("Signup returns token",          !!signupA.data?.token,         JSON.stringify(signupA));
  assert("Signup returns organization",   !!signupA.data?.organization?.name);
  assert("Organization name matches",     signupA.data?.organization?.name === `OrgA_${TS}`);

  const tokenA = signupA.data?.token;

  /* ─────────────────────────────────────────
   * 2. LOGIN – same user
   * ───────────────────────────────────────── */
  const loginA = await req("/auth/login", {
    method: "POST",
    body: { email: `a_${TS}@demo.com`, password: "password123" },
  });
  assert("Login returns token",           !!loginA.data?.token);
  assert("Login org name matches signup", loginA.data?.organization?.name === `OrgA_${TS}`);

  /* ─────────────────────────────────────────
   * 3. DASHBOARD – empty state after signup
   * ───────────────────────────────────────── */
  console.log("\n── 2. DASHBOARD: Empty state after signup ─────────");
  const dashEmpty = await req("/dashboard", { token: tokenA });
  assert("Dashboard loads (success:true)",   dashEmpty.success);
  assert("Total products starts at 0",       dashEmpty.data.totalProducts === 0);
  assert("Total quantity starts at 0",       dashEmpty.data.totalQuantity === 0);
  assert("No low-stock items initially",     dashEmpty.data.lowStockItems.length === 0);

  /* ─────────────────────────────────────────
   * 4. CREATE PRODUCTS
   * ───────────────────────────────────────── */
  console.log("\n── 3. PRODUCTS: Create with SKU and quantity ──────");

  // Product 1: well-stocked (qty=50, threshold=10)
  const p1 = await req("/products", {
    method: "POST", token: tokenA,
    body: { name: "Laptop Stand", sku: `LS-${TS}`, quantity: 50, lowStockThreshold: 10, sellingPrice: 29.99 },
  });
  assert("Create product 1 (success)", p1.success);
  assert("Product 1 has correct SKU",  p1.data?.sku === `LS-${TS}`);
  assert("Product 1 qty = 50",         p1.data?.quantity === 50);
  const id1 = p1.data?.id;

  // Product 2: low-stock from the start (qty=3, threshold=10)
  const p2 = await req("/products", {
    method: "POST", token: tokenA,
    body: { name: "USB Hub", sku: `UH-${TS}`, quantity: 3, lowStockThreshold: 10 },
  });
  assert("Create product 2 (success)",        p2.success);
  assert("Product 2 qty=3 (below threshold)", p2.data?.quantity === 3);
  const id2 = p2.data?.id;

  // Product 3: uses ORG default threshold (no per-product threshold set)
  const p3 = await req("/products", {
    method: "POST", token: tokenA,
    body: { name: "HDMI Cable", sku: `HC-${TS}`, quantity: 2 },
  });
  assert("Create product 3 (no per-product threshold)", p3.success);
  const id3 = p3.data?.id;

  /* ─────────────────────────────────────────
   * 5. PRODUCT LIST
   * ───────────────────────────────────────── */
  console.log("\n── 4. PRODUCT LIST: Appears in list ───────────────");
  const list = await req("/products", { token: tokenA });
  assert("List returns success",          list.success);
  assert("All 3 products in list",        list.data?.length === 3);
  const skus = list.data.map(p => p.sku);
  assert("Product 1 SKU in list",         skus.includes(`LS-${TS}`));
  assert("Product 2 SKU in list",         skus.includes(`UH-${TS}`));
  assert("Product 3 SKU in list",         skus.includes(`HC-${TS}`));

  /* ─────────────────────────────────────────
   * 6. DASHBOARD – reflects products
   * ───────────────────────────────────────── */
  console.log("\n── 5. DASHBOARD: Shows correct totals ─────────────");
  const dash1 = await req("/dashboard", { token: tokenA });
  assert("Total products = 3",            dash1.data.totalProducts === 3);
  assert("Total quantity = 55",           dash1.data.totalQuantity === 55,
         `got ${dash1.data.totalQuantity}`);

  /* ─────────────────────────────────────────
   * 7. LOW-STOCK CALCULATION
   * ───────────────────────────────────────── */
  console.log("\n── 6. LOW STOCK: Threshold-based detection ────────");
  // Default org threshold = 5
  // p1: qty=50, threshold=10 → OK
  // p2: qty=3,  threshold=10 → LOW ✓
  // p3: qty=2,  threshold=null → uses org default(5) → LOW ✓
  const lowItems = dash1.data.lowStockItems;
  const lowSkus  = lowItems.map(i => i.sku);
  assert("Low stock count = 2 (p2 + p3)", lowItems.length === 2,
         `got ${lowItems.length}: ${JSON.stringify(lowSkus)}`);
  assert("Product 2 flagged as low stock", lowSkus.includes(`UH-${TS}`));
  assert("Product 3 flagged via org default threshold", lowSkus.includes(`HC-${TS}`));
  assert("Product 1 NOT flagged (qty 50 >> threshold 10)", !lowSkus.includes(`LS-${TS}`));

  /* ─────────────────────────────────────────
   * 8. SETTINGS: Update default threshold
   * ───────────────────────────────────────── */
  console.log("\n── 7. SETTINGS: Default threshold management ──────");
  const getSettings = await req("/settings", { token: tokenA });
  assert("GET /settings success",             getSettings.success);
  assert("Default threshold returned",        getSettings.data.defaultLowStockThreshold === 5);

  // Raise threshold to 60 → now p1 (qty=50) also becomes low stock
  const putSettings = await req("/settings", {
    method: "PUT", token: tokenA,
    body: { defaultLowStockThreshold: 60 },
  });
  assert("PUT /settings success",             putSettings.success);
  assert("Threshold updated to 60",           putSettings.data.defaultLowStockThreshold === 60);

  const dash2 = await req("/dashboard", { token: tokenA });
  const lowAfterUpdate = dash2.data.lowStockItems.map(i => i.sku);
  // p1 has its OWN threshold=10 (qty=50 >> 10 → still OK)
  // p2 has its OWN threshold=10 (qty=3  <=  10 → LOW)
  // p3 has NO threshold → uses org default=60 (qty=2 <= 60 → LOW)
  // So still 2 low-stock items; p1's per-product threshold takes priority.
  assert("After raising org threshold to 60: p2 and p3 still flagged (p1 uses own threshold=10)",
         dash2.data.lowStockItems.length === 2,
         `got ${dash2.data.lowStockItems.length}: ${JSON.stringify(lowAfterUpdate)}`);

  // Reset threshold back to 5
  await req("/settings", { method: "PUT", token: tokenA, body: { defaultLowStockThreshold: 5 } });

  /* ─────────────────────────────────────────
   * 9. STOCK ADJUSTMENT (inline +/- N)
   * ───────────────────────────────────────── */
  console.log("\n── 8. STOCK ADJUSTMENT: Inline +/- ────────────────");
  const adjUp = await req(`/products/${id2}/adjust`, {
    method: "PATCH", token: tokenA,
    body: { adjustment: 10, note: "Restock from supplier" },
  });
  assert("Adjustment +10 success",            adjUp.success);
  assert("qty now 13 (3+10)",                 adjUp.data.quantity === 13,
         `got ${adjUp.data.quantity}`);
  assert("lastUpdateNote recorded",           adjUp.data.lastUpdateNote === "Restock from supplier");
  assert("lastUpdatedBy set to userId",       !!adjUp.data.lastUpdatedBy);

  // Negative adjustment
  const adjDown = await req(`/products/${id2}/adjust`, {
    method: "PATCH", token: tokenA,
    body: { adjustment: -5, note: "Damaged goods" },
  });
  assert("Adjustment -5 success",             adjDown.success);
  assert("qty now 8 (13-5)",                  adjDown.data.quantity === 8,
         `got ${adjDown.data.quantity}`);

  // Reject adjustment that would go negative
  const adjBad = await req(`/products/${id2}/adjust`, {
    method: "PATCH", token: tokenA,
    body: { adjustment: -999 },
  });
  assert("Reject negative-stock adjustment",  !adjBad.success);

  /* ─────────────────────────────────────────
   * 10. CROSS-TENANT ISOLATION
   * ───────────────────────────────────────── */
  console.log("\n── 9. CROSS-TENANT: Org isolation ─────────────────");
  // Sign up as Org B
  const signupB = await req("/auth/signup", {
    method: "POST",
    body: { email: `b_${TS}@demo.com`, password: "password123", confirmPassword: "password123", organizationName: `OrgB_${TS}` },
  });
  assert("Org B signup ok", !!signupB.data?.token);
  const tokenB = signupB.data?.token;

  // Org B sees no products
  const listB = await req("/products", { token: tokenB });
  assert("Org B sees 0 products (isolation)", listB.data?.length === 0,
         `got ${listB.data?.length}`);

  // Org B dashboard is zeroed
  const dashB = await req("/dashboard", { token: tokenB });
  assert("Org B dashboard totalProducts=0",   dashB.data.totalProducts === 0);
  assert("Org B dashboard totalQuantity=0",   dashB.data.totalQuantity === 0);
  assert("Org B no low-stock items",          dashB.data.lowStockItems.length === 0);

  // Org B cannot GET Org A's product by ID
  const getP1byB = await req(`/products/${id1}`, { token: tokenB });
  assert("Org B cannot access Org A product", !getP1byB.success, JSON.stringify(getP1byB));

  // Duplicate SKU within Org A should fail
  const dupSku = await req("/products", {
    method: "POST", token: tokenA,
    body: { name: "Dup", sku: `LS-${TS}`, quantity: 1 },
  });
  assert("Duplicate SKU within same org rejected", !dupSku.success,
         JSON.stringify(dupSku));

  // Same SKU in Org B should succeed (cross-org SKUs are independent)
  const sameSku = await req("/products", {
    method: "POST", token: tokenB,
    body: { name: "Diff Org Same SKU", sku: `LS-${TS}`, quantity: 5 },
  });
  assert("Same SKU in different org is allowed", sameSku.success,
         JSON.stringify(sameSku));

  /* ─────────────────────────────────────────
   * 11. DELETE PRODUCT
   * ───────────────────────────────────────── */
  console.log("\n── 10. DELETE: Product removal ─────────────────────");
  const del1 = await req(`/products/${id1}`, { method: "DELETE", token: tokenA });
  assert("Delete product success",             del1.success);
  const listAfterDel = await req("/products", { token: tokenA });
  assert("List now has 2 products",            listAfterDel.data?.length === 2,
         `got ${listAfterDel.data?.length}`);

  // Org B cannot delete Org A's product
  const delCross = await req(`/products/${id2}`, { method: "DELETE", token: tokenB });
  assert("Org B cannot delete Org A product",  !delCross.success,
         JSON.stringify(delCross));

  /* ─────────────────────────────────────────
   * FINAL SUMMARY
   * ───────────────────────────────────────── */
  console.log("\n══════════════════════════════════════════════════");
  if (process.exitCode === 1) {
    console.log("❌  Some tests FAILED – review output above.");
  } else {
    console.log("✅  All integration tests passed! App is demo-ready.");
  }
  console.log("══════════════════════════════════════════════════\n");
}

run().catch((err) => {
  console.error("\nUnhandled error:", err);
  process.exit(1);
});
