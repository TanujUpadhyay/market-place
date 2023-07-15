const express = require("express");
const { getAllUsers } = require("../controllers/userController.js");
const { protectRoute, isAdmin } = require("../middlewares/authMiddleware.js");
const router = express.Router();

router.route("/").post(getAllUsers).get(getAllUsers);

module.exports = router;
