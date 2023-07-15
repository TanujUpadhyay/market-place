const { NODE_ENV } = require("../../config");

const consoleLogger = (string) => {
  if (NODE_ENV === "development") console.log(string);
};

module.exports = {
  consoleLogger,
};
