const productRepository = require("../repositories/product.repository");
const { validateCreateProduct, validateUpdateProduct, validateAdjustStock } = require("../validators/product.validator");

class ProductError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

async function getAllProducts(organizationId) {
  return productRepository.findAllByOrg(organizationId);
}

async function getProductById(id, organizationId) {
  const product = await productRepository.findByIdAndOrg(id, organizationId);
  if (!product) {
    throw new ProductError("Product not found.", 404);
  }
  return product;
}

async function createProduct(organizationId, data) {
  const validation = validateCreateProduct(data);
  if (!validation.isValid) {
    throw new ProductError(validation.errors.join(" "), 400);
  }

  try {
    return await productRepository.create(organizationId, data);
  } catch (err) {
    if (err.code === "P2002") {
      throw new ProductError(
        `SKU "${data.sku}" already exists in your organization. Please use a unique SKU.`,
        409
      );
    }
    throw err;
  }
}

async function updateProduct(id, organizationId, data) {
  const validation = validateUpdateProduct(data);
  if (!validation.isValid) {
    throw new ProductError(validation.errors.join(" "), 400);
  }

  const existing = await productRepository.findByIdAndOrg(id, organizationId);
  if (!existing) {
    throw new ProductError("Product not found.", 404);
  }

  try {
    return await productRepository.update(id, existing, data);
  } catch (err) {
    if (err.code === "P2002") {
      throw new ProductError(
        `SKU "${data.sku}" already exists in your organization. Please use a unique SKU.`,
        409
      );
    }
    throw err;
  }
}

async function deleteProduct(id, organizationId) {
  const existing = await productRepository.findByIdAndOrg(id, organizationId);
  if (!existing) {
    throw new ProductError("Product not found.", 404);
  }

  await productRepository.remove(id);
}

async function adjustProductStock(id, organizationId, userId, data) {
  const validation = validateAdjustStock(data);
  if (!validation.isValid) {
    throw new ProductError(validation.errors.join(" "), 400);
  }

  const existing = await productRepository.findByIdAndOrg(id, organizationId);
  if (!existing) {
    throw new ProductError("Product not found.", 404);
  }

  const newQuantity = existing.quantity + Number(data.adjustment);
  if (newQuantity < 0) {
    throw new ProductError("Stock adjustment would result in negative quantity.", 400);
  }

  return await productRepository.adjustStock(id, newQuantity, userId, data.note);
}

module.exports = {
  ProductError,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustProductStock,
};
