const express = require("express");
const prisma = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// GET /api/dashboard - summary + low-stock list, scoped to caller's org
router.get("/", async (req, res) => {
  const org = await prisma.organization.findUnique({
    where: { id: req.organizationId },
  });

  const products = await prisma.product.findMany({
    where: { organizationId: req.organizationId },
  });

  const totalProducts = products.length;
  const totalQuantity = products.reduce((sum, p) => sum + p.quantityOnHand, 0);

  const defaultThreshold = org?.defaultLowStockThreshold ?? 5;

  const lowStockItems = products
    .filter((p) => {
      const threshold = p.lowStockThreshold ?? defaultThreshold;
      return p.quantityOnHand <= threshold;
    })
    .map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      quantityOnHand: p.quantityOnHand,
      lowStockThreshold: p.lowStockThreshold ?? defaultThreshold,
    }));

  res.json({ totalProducts, totalQuantity, lowStockItems });
});

module.exports = router;
