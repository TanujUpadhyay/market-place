const getAllUsers = async (req, res) => {
  console.log("hello");
  res.json({
    hello: "hello",
  });
};

module.exports = {
  getAllUsers,
};
