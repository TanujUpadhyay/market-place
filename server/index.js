const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const cookieSession = require("cookie-session");
const compression = require("compression");
const path = require("path");
const { PORT, COOKIE_SESSION_KEY, NODE_ENV } = require("../config");
const connectDB = require("./dbs/mongoDb");
// my routes
const routerConfigration = require("./routes");
const { notFound, errorHandler } = require("./middlewares/utils");
const { consoleLogger } = require("./utils/helper");

const app = express();

// use morgan in development mode
if (NODE_ENV === "development") app.use(morgan("dev"));

// connect to the mongoDB database
connectDB();

app.use(express.json()); // middleware to use req.body
app.use(cors()); // to avoid CORS errors
app.use(compression()); // to use gzip

// use cookie sessions
app.use(
  cookieSession({
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    keys: [COOKIE_SESSION_KEY],
  })
);

// configure all the routes
routerConfigration(app);

// To prepare for deployment
if (NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/client/build")));

  app.use("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"))
  );
}

// middleware to act as fallback for all 404 errors
app.use(notFound);

// configure a custome error handler middleware
app.use(errorHandler);

app.listen(PORT, () => consoleLogger(`Server running  on port ${PORT}`));
