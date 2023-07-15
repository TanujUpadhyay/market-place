const express = require("express");
const {
  getAllUsers,
  registerUser,
  deleteUser,
  getUserById,
  updateUserById,
  authUser,
  getAccessToken,
  confirmUser,
  mailForEmailVerification,
  resetUserPassword,
  mailForPasswordReset,
} = require("../controllers/userController.js");
const { protectRoute, isAdmin } = require("../middlewares/authMiddleware.js");
const router = express.Router();

router.route("/").get(getAllUsers);
router.route("/registerUser/").post(registerUser);
router.route("/login").post(authUser);
router.route("/confirm/:token").get(confirmUser);
router.route("/confirm").post(mailForEmailVerification);
router.route("/reset").post(mailForPasswordReset).put(resetUserPassword);
router.route("/refresh").post(getAccessToken);
router.route("/:id").delete(deleteUser).get(getUserById).put(updateUserById);

module.exports = router;
