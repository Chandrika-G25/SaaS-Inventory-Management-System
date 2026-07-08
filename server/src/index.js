require("dotenv").config();
const express = require("express");
const cors = require("cors");


const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/products.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const settingsRoutes = require("./routes/settings.routes");

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/settings", settingsRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

// Serve the built React app in production (single-service deployment)
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "StockFlow Backend API is running 🚀"
  });
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`StockFlow server running on port ${PORT}`);
});
