function validateCreateProduct(data) {
  const { name, sku } = data;
  const errors = [];

  if (!name || typeof name !== "string" || !name.trim()) {
    errors.push("Product name is required.");
  }

  if (!sku || typeof sku !== "string" || !sku.trim()) {
    errors.push("SKU is required.");
  }

  const numericFields = { costPrice: data.costPrice, sellingPrice: data.sellingPrice };
  for (const [field, value] of Object.entries(numericFields)) {
    if (value !== undefined && value !== null && value !== "") {
      if (isNaN(Number(value)) || Number(value) < 0) {
        errors.push(`${field} must be a non-negative number.`);
      }
    }
  }

  if (data.quantity !== undefined && data.quantity !== null && data.quantity !== "") {
    if (isNaN(Number(data.quantity)) || Number(data.quantity) < 0) {
      errors.push("Quantity must be a non-negative integer.");
    }
  }

  if (
    data.lowStockThreshold !== undefined &&
    data.lowStockThreshold !== null &&
    data.lowStockThreshold !== ""
  ) {
    if (isNaN(Number(data.lowStockThreshold)) || Number(data.lowStockThreshold) < 0) {
      errors.push("Low stock threshold must be a non-negative integer.");
    }
  }

  return { isValid: errors.length === 0, errors };
}

function validateUpdateProduct(data) {
  const errors = [];

  if (data.name !== undefined && (!data.name || !String(data.name).trim())) {
    errors.push("Product name cannot be empty.");
  }

  if (data.sku !== undefined && (!data.sku || !String(data.sku).trim())) {
    errors.push("SKU cannot be empty.");
  }

  const numericFields = { costPrice: data.costPrice, sellingPrice: data.sellingPrice };
  for (const [field, value] of Object.entries(numericFields)) {
    if (value !== undefined && value !== null && value !== "") {
      if (isNaN(Number(value)) || Number(value) < 0) {
        errors.push(`${field} must be a non-negative number.`);
      }
    }
  }

  if (data.quantity !== undefined && data.quantity !== null && data.quantity !== "") {
    if (isNaN(Number(data.quantity)) || Number(data.quantity) < 0) {
      errors.push("Quantity must be a non-negative integer.");
    }
  }

  if (
    data.lowStockThreshold !== undefined &&
    data.lowStockThreshold !== null &&
    data.lowStockThreshold !== ""
  ) {
    if (isNaN(Number(data.lowStockThreshold)) || Number(data.lowStockThreshold) < 0) {
      errors.push("Low stock threshold must be a non-negative integer.");
    }
  }

  return { isValid: errors.length === 0, errors };
}

function validateAdjustStock(data) {
  const errors = [];

  if (data.adjustment === undefined || data.adjustment === null || data.adjustment === "") {
    errors.push("Adjustment amount is required.");
  } else if (isNaN(Number(data.adjustment))) {
    errors.push("Adjustment must be a number.");
  }

  if (data.note !== undefined && typeof data.note !== "string") {
    errors.push("Note must be a string.");
  }

  return { isValid: errors.length === 0, errors };
}

module.exports = { validateCreateProduct, validateUpdateProduct, validateAdjustStock };
