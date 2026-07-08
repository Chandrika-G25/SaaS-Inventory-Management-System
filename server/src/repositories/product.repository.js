const prisma = require("../lib/prisma");

async function findAllByOrg(organizationId) {
  return prisma.product.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  });
}

async function findByIdAndOrg(id, organizationId) {
  return prisma.product.findFirst({
    where: { id, organizationId },
  });
}

async function create(organizationId, data) {
  return prisma.product.create({
    data: {
      organizationId,
      name: data.name.trim(),
      sku: data.sku.trim(),
      description: data.description ? data.description.trim() : null,
      quantity: data.quantity != null && data.quantity !== "" ? Number(data.quantity) : 0,
      costPrice: data.costPrice != null && data.costPrice !== "" ? Number(data.costPrice) : null,
      sellingPrice:
        data.sellingPrice != null && data.sellingPrice !== "" ? Number(data.sellingPrice) : null,
      lowStockThreshold:
        data.lowStockThreshold != null && data.lowStockThreshold !== ""
          ? Number(data.lowStockThreshold)
          : null,
    },
  });
}

async function update(id, existing, data) {
  return prisma.product.update({
    where: { id },
    data: {
      name: data.name !== undefined ? data.name.trim() : existing.name,
      sku: data.sku !== undefined ? data.sku.trim() : existing.sku,
      description: data.description !== undefined ? data.description : existing.description,
      quantity:
        data.quantity != null && data.quantity !== ""
          ? Number(data.quantity)
          : existing.quantity,
      costPrice:
        data.costPrice != null && data.costPrice !== ""
          ? Number(data.costPrice)
          : existing.costPrice,
      sellingPrice:
        data.sellingPrice != null && data.sellingPrice !== ""
          ? Number(data.sellingPrice)
          : existing.sellingPrice,
      lowStockThreshold:
        data.lowStockThreshold != null && data.lowStockThreshold !== ""
          ? Number(data.lowStockThreshold)
          : existing.lowStockThreshold,
    },
  });
}

async function remove(id) {
  return prisma.product.delete({ where: { id } });
}

async function adjustStock(id, newQuantity, userId, note) {
  return prisma.product.update({
    where: { id },
    data: {
      quantity: newQuantity,
      lastUpdatedBy: userId,
      lastUpdateNote: note || null,
    },
  });
}

module.exports = { findAllByOrg, findByIdAndOrg, create, update, remove, adjustStock };
