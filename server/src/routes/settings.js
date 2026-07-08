const express = require("express");
const prisma = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// GET /api/settings
router.get("/", async (req, res) => {
  const org = await prisma.organization.findUnique({
    where: { id: req.organizationId },
  });
  res.json({ defaultLowStockThreshold: org.defaultLowStockThreshold });
});

// PUT /api/settings
router.put("/", async (req, res) => {
  const { defaultLowStockThreshold } = req.body;

  if (defaultLowStockThreshold == null || isNaN(Number(defaultLowStockThreshold))) {
    return res.status(400).json({ error: "defaultLowStockThreshold must be a number" });
  }

  const org = await prisma.organization.update({
    where: { id: req.organizationId },
    data: { defaultLowStockThreshold: Number(defaultLowStockThreshold) },
  });

  res.json({ defaultLowStockThreshold: org.defaultLowStockThreshold });
});

module.exports = router;
