const express = require("express");
const {
  getAllUsers,
  registerUser,
  deleteUser,
  getUserById,
  updateUserById,
} = require("../controllers/userController.js");
const { protectRoute, isAdmin } = require("../middlewares/authMiddleware.js");
const router = express.Router();

router.route("/").get(getAllUsers);
router.route("/registerUser/").post(registerUser);
router.route("/:id").delete(deleteUser).get(getUserById).put(updateUserById);

module.exports = router;
