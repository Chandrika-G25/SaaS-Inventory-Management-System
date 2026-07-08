const express = require("express");
const productController = require("../controllers/product.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

// All product routes require authentication
router.use(requireAuth);

router.get("/", productController.getAll);
router.get("/:id", productController.getById);
router.post("/", productController.create);
router.put("/:id", productController.update);
router.patch("/:id/adjust", productController.adjustStock);
router.delete("/:id", productController.remove);

module.exports = router;
