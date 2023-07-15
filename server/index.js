const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const cookieSession = require("cookie-session");
const compression = require("compression");
const path = require("path");
const { PORT } = require("../config");
const connectDB = require("./dbs/mongoDb");
// my routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");
const productRoutes = require("./routes/product");
const orderRouters = require("./routes/order");

const app = express();

// use morgan in development mode
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// connect to the mongoDB database
connectDB();

app.use(express.json()); // middleware to use req.body
app.use(cors()); // to avoid CORS errors
app.use(compression()); // to use gzip

// use cookie sessions
app.use(
  cookieSession({
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    keys: [process.env.COOKIE_SESSION_KEY],
  })
);

// configure all the routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categorys", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRouters);

// To prepare for deployment
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/client/build")));

  app.use("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"))
  );
}

app.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
