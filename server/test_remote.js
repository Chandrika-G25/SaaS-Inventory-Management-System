/**
 * StockFlow MVP – Remote Integration Test (targets deployed Render backend)
 * Same logic as test_e2e.js but uses the production API URL.
 */

const URL = "https://saas-inventory-management-system-y19p.onrender.com/api";
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
  console.log("║   StockFlow MVP – Remote Integration Test        ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  /* ── Health check ── */
  console.log("── 0. HEALTH CHECK ─────────────────────────────────");
  try {
    const health = await req("/health");
    assert("API /health responds", health.ok === true, JSON.stringify(health));
  } catch(e) {
    console.error(`  ❌ FAIL: API unreachable – ${e.message}`);
    process.exitCode = 1;
    return;
  }

  /* ── 1. AUTH ── */
  console.log("\n── 1. AUTH: Signup & Login ────────────────────────");
  const signupA = await req("/auth/signup", {
    method: "POST",
    body: { email: `a_${TS}@demo.com`, password: "password123", confirmPassword: "password123", organizationName: `OrgA_${TS}` },
  });
  assert("Signup returns token",          !!signupA.data?.token,         JSON.stringify(signupA));
  assert("Signup returns organization",   !!signupA.data?.organization?.name);
  assert("Organization name matches",     signupA.data?.organization?.name === `OrgA_${TS}`);

  const tokenA = signupA.data?.token;
  if (!tokenA) { console.error("\nFATAL: Cannot proceed without auth token.\n"); process.exit(1); }

  const loginA = await req("/auth/login", {
    method: "POST",
    body: { email: `a_${TS}@demo.com`, password: "password123" },
  });
  assert("Login returns token",           !!loginA.data?.token);
  assert("Login org name matches signup", loginA.data?.organization?.name === `OrgA_${TS}`);

  /* ── 2. DASHBOARD empty ── */
  console.log("\n── 2. DASHBOARD: Empty state after signup ─────────");
  const dashEmpty = await req("/dashboard", { token: tokenA });
  assert("Dashboard loads",              dashEmpty.success);
  assert("Total products = 0",           dashEmpty.data.totalProducts === 0);
  assert("Total quantity = 0",           dashEmpty.data.totalQuantity === 0);
  assert("No low-stock items",           dashEmpty.data.lowStockItems.length === 0);

  /* ── 3. CREATE PRODUCTS ── */
  console.log("\n── 3. PRODUCTS: Create with SKU and quantity ──────");
  const p1 = await req("/products", {
    method: "POST", token: tokenA,
    body: { name: "Laptop Stand", sku: `LS-${TS}`, quantity: 50, lowStockThreshold: 10, sellingPrice: 29.99 },
  });
  assert("Create product 1", p1.success);
  assert("Product 1 SKU",    p1.data?.sku === `LS-${TS}`);
  assert("Product 1 qty=50", p1.data?.quantity === 50);
  const id1 = p1.data?.id;

  const p2 = await req("/products", {
    method: "POST", token: tokenA,
    body: { name: "USB Hub", sku: `UH-${TS}`, quantity: 3, lowStockThreshold: 10 },
  });
  assert("Create product 2", p2.success);
  assert("Product 2 qty=3",  p2.data?.quantity === 3);
  const id2 = p2.data?.id;

  const p3 = await req("/products", {
    method: "POST", token: tokenA,
    body: { name: "HDMI Cable", sku: `HC-${TS}`, quantity: 2 },
  });
  assert("Create product 3 (no threshold)", p3.success);
  const id3 = p3.data?.id;

  /* ── 4. PRODUCT LIST ── */
  console.log("\n── 4. PRODUCT LIST ─────────────────────────────────");
  const list = await req("/products", { token: tokenA });
  assert("List success",       list.success);
  assert("3 products in list", list.data?.length === 3, `got ${list.data?.length}`);
  const skus = list.data.map(p => p.sku);
  assert("SKU 1 in list", skus.includes(`LS-${TS}`));
  assert("SKU 2 in list", skus.includes(`UH-${TS}`));
  assert("SKU 3 in list", skus.includes(`HC-${TS}`));

  /* ── 5. DASHBOARD totals ── */
  console.log("\n── 5. DASHBOARD: Shows correct totals ─────────────");
  const dash1 = await req("/dashboard", { token: tokenA });
  assert("Total products = 3", dash1.data.totalProducts === 3);
  assert("Total quantity = 55", dash1.data.totalQuantity === 55, `got ${dash1.data.totalQuantity}`);

  /* ── 6. LOW STOCK ── */
  console.log("\n── 6. LOW STOCK: Threshold detection ──────────────");
  const lowItems = dash1.data.lowStockItems;
  const lowSkus  = lowItems.map(i => i.sku);
  assert("Low stock count = 2 (p2+p3)", lowItems.length === 2, `got ${lowItems.length}: ${JSON.stringify(lowSkus)}`);
  assert("Product 2 flagged",            lowSkus.includes(`UH-${TS}`));
  assert("Product 3 flagged (org default)", lowSkus.includes(`HC-${TS}`));
  assert("Product 1 NOT flagged",        !lowSkus.includes(`LS-${TS}`));

  /* ── 7. SETTINGS ── */
  console.log("\n── 7. SETTINGS: Default threshold ─────────────────");
  const getSettings = await req("/settings", { token: tokenA });
  assert("GET /settings success",    getSettings.success);
  assert("Default threshold = 5",    getSettings.data.defaultLowStockThreshold === 5);

  const putSettings = await req("/settings", {
    method: "PUT", token: tokenA,
    body: { defaultLowStockThreshold: 60 },
  });
  assert("PUT /settings success",    putSettings.success);
  assert("Threshold updated to 60",  putSettings.data.defaultLowStockThreshold === 60);

  const dash2 = await req("/dashboard", { token: tokenA });
  assert("After threshold=60: still 2 low-stock (p1 uses own threshold=10)",
         dash2.data.lowStockItems.length === 2,
         `got ${dash2.data.lowStockItems.length}`);

  await req("/settings", { method: "PUT", token: tokenA, body: { defaultLowStockThreshold: 5 } });

  /* ── 8. STOCK ADJUSTMENT ── */
  console.log("\n── 8. STOCK ADJUSTMENT ─────────────────────────────");
  const adjUp = await req(`/products/${id2}/adjust`, {
    method: "PATCH", token: tokenA,
    body: { adjustment: 10, note: "Restock from supplier" },
  });
  assert("Adjustment +10 success", adjUp.success);
  assert("qty now 13",             adjUp.data.quantity === 13, `got ${adjUp.data.quantity}`);
  assert("note recorded",          adjUp.data.lastUpdateNote === "Restock from supplier");
  assert("lastUpdatedBy set",      !!adjUp.data.lastUpdatedBy);

  const adjDown = await req(`/products/${id2}/adjust`, {
    method: "PATCH", token: tokenA,
    body: { adjustment: -5, note: "Damaged goods" },
  });
  assert("Adjustment -5 success", adjDown.success);
  assert("qty now 8",             adjDown.data.quantity === 8, `got ${adjDown.data.quantity}`);

  const adjBad = await req(`/products/${id2}/adjust`, {
    method: "PATCH", token: tokenA,
    body: { adjustment: -999 },
  });
  assert("Reject negative-stock", !adjBad.success);

  /* ── 9. CROSS-TENANT ISOLATION ── */
  console.log("\n── 9. CROSS-TENANT: Org isolation ─────────────────");
  const signupB = await req("/auth/signup", {
    method: "POST",
    body: { email: `b_${TS}@demo.com`, password: "password123", confirmPassword: "password123", organizationName: `OrgB_${TS}` },
  });
  assert("Org B signup ok", !!signupB.data?.token);
  const tokenB = signupB.data?.token;

  const listB = await req("/products", { token: tokenB });
  assert("Org B sees 0 products", listB.data?.length === 0, `got ${listB.data?.length}`);

  const dashB = await req("/dashboard", { token: tokenB });
  assert("Org B totalProducts=0",  dashB.data.totalProducts === 0);
  assert("Org B totalQuantity=0",  dashB.data.totalQuantity === 0);
  assert("Org B no low-stock",     dashB.data.lowStockItems.length === 0);

  const getP1byB = await req(`/products/${id1}`, { token: tokenB });
  assert("Org B cannot access Org A product", !getP1byB.success, JSON.stringify(getP1byB));

  const dupSku = await req("/products", {
    method: "POST", token: tokenA,
    body: { name: "Dup", sku: `LS-${TS}`, quantity: 1 },
  });
  assert("Duplicate SKU in same org rejected", !dupSku.success, JSON.stringify(dupSku));

  const sameSku = await req("/products", {
    method: "POST", token: tokenB,
    body: { name: "Diff Org Same SKU", sku: `LS-${TS}`, quantity: 5 },
  });
  assert("Same SKU in different org allowed", sameSku.success, JSON.stringify(sameSku));

  /* ── 10. DELETE ── */
  console.log("\n── 10. DELETE ──────────────────────────────────────");
  const del1 = await req(`/products/${id1}`, { method: "DELETE", token: tokenA });
  assert("Delete product success", del1.success);
  const listAfterDel = await req("/products", { token: tokenA });
  assert("List now has 2 products", listAfterDel.data?.length === 2, `got ${listAfterDel.data?.length}`);

  const delCross = await req(`/products/${id2}`, { method: "DELETE", token: tokenB });
  assert("Org B cannot delete Org A product", !delCross.success, JSON.stringify(delCross));

  /* ── FINAL ── */
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
