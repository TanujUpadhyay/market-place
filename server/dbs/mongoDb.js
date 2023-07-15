const mongoose = require("mongoose");
const { MONGO_DB } = require("../../config");

// connect to the mongoDB collection
const connectDB = () => {
  mongoose
    .connect(MONGO_DB, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    })
    .then((res) => console.log(`MongoDB Connected: ${res.connection.host}`))
    .catch((err) => {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    });
};

module.exports = connectDB;
