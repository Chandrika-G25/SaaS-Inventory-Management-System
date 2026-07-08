const express = require("express");
const prisma = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// GET /api/products - list all products for the caller's org
router.get("/", async (req, res) => {
  const products = await prisma.product.findMany({
    where: { organizationId: req.organizationId },
    orderBy: { createdAt: "desc" },
  });
  res.json(products);
});

// POST /api/products - create a product in the caller's org
router.post("/", async (req, res) => {
  const { name, sku, description, quantityOnHand, costPrice, sellingPrice, lowStockThreshold } =
    req.body;

  if (!name || !sku) {
    return res.status(400).json({ error: "name and sku are required" });
  }

  try {
    const product = await prisma.product.create({
      data: {
        organizationId: req.organizationId,
        name,
        sku,
        description: description || null,
        quantityOnHand: quantityOnHand != null ? Number(quantityOnHand) : 0,
        costPrice: costPrice != null && costPrice !== "" ? Number(costPrice) : null,
        sellingPrice: sellingPrice != null && sellingPrice !== "" ? Number(sellingPrice) : null,
        lowStockThreshold:
          lowStockThreshold != null && lowStockThreshold !== "" ? Number(lowStockThreshold) : null,
        lastUpdatedBy: req.userId,
      },
    });
    res.status(201).json(product);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "SKU already exists in your organization" });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// PUT /api/products/:id - update a product (must belong to caller's org)
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, sku, description, quantityOnHand, costPrice, sellingPrice, lowStockThreshold } =
    req.body;

  try {
    // Scope the update to the org by checking ownership first
    const existing = await prisma.product.findFirst({
      where: { id, organizationId: req.organizationId },
    });
    if (!existing) {
      return res.status(404).json({ error: "Product not found" });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        sku: sku ?? existing.sku,
        description: description ?? existing.description,
        quantityOnHand: quantityOnHand != null ? Number(quantityOnHand) : existing.quantityOnHand,
        costPrice: costPrice != null && costPrice !== "" ? Number(costPrice) : existing.costPrice,
        sellingPrice:
          sellingPrice != null && sellingPrice !== "" ? Number(sellingPrice) : existing.sellingPrice,
        lowStockThreshold:
          lowStockThreshold != null && lowStockThreshold !== ""
            ? Number(lowStockThreshold)
            : existing.lowStockThreshold,
        lastUpdatedBy: req.userId,
      },
    });
    res.json(product);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "SKU already exists in your organization" });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// DELETE /api/products/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.product.findFirst({
    where: { id, organizationId: req.organizationId },
  });
  if (!existing) {
    return res.status(404).json({ error: "Product not found" });
  }

  await prisma.product.delete({ where: { id } });
  res.status(204).send();
});

module.exports = router;
