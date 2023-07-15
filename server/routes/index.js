const authRoutes = require("./auth");
const userRoutes = require("./user");
const categoryRoutes = require("./category");
const productRoutes = require("./product");
const orderRouters = require("./order");

const routerConfigration = (app) => {
  // app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  // app.use("/api/categorys", categoryRoutes);
  // app.use("/api/products", productRoutes);
  // app.use("/api/orders", orderRouters);
};

module.exports = routerConfigration;
