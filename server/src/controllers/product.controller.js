const productService = require("../services/product.service");

async function getAll(req, res) {
  try {
    const products = await productService.getAllProducts(req.organizationId);
    return res.status(200).json({
      success: true,
      message: "Products retrieved successfully.",
      data: products,
    });
  } catch (error) {
    console.error("GetAll error:", error);
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Failed to retrieve products.",
    });
  }
}

async function getById(req, res) {
  try {
    const product = await productService.getProductById(req.params.id, req.organizationId);
    return res.status(200).json({
      success: true,
      message: "Product retrieved successfully.",
      data: product,
    });
  } catch (error) {
    console.error("GetById error:", error);
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Failed to retrieve product.",
    });
  }
}

async function create(req, res) {
  try {
    const product = await productService.createProduct(req.organizationId, req.body);
    return res.status(201).json({
      success: true,
      message: "Product created successfully.",
      data: product,
    });
  } catch (error) {
    console.error("Create product error:", error);
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Failed to create product.",
    });
  }
}

async function update(req, res) {
  try {
    const product = await productService.updateProduct(
      req.params.id,
      req.organizationId,
      req.body
    );
    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      data: product,
    });
  } catch (error) {
    console.error("Update product error:", error);
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Failed to update product.",
    });
  }
}

async function remove(req, res) {
  try {
    await productService.deleteProduct(req.params.id, req.organizationId);
    return res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
      data: null,
    });
  } catch (error) {
    console.error("Delete product error:", error);
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

async function adjustStock(req, res) {
  try {
    const updated = await productService.adjustProductStock(
      req.params.id,
      req.organizationId,
      req.userId,
      req.body
    );
    res.json({ success: true, message: "Stock adjusted successfully.", data: updated });
  } catch (error) {
    console.error("Adjust stock error:", error);
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

module.exports = { getAll, getById, create, update, remove, adjustStock };
