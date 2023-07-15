const { JWT_ACCESS_TOKEN_SECRET } = require("../../config");

const jwt = require("jsonwebtoken");
// const asyncHandler = require("express-async-handler");
const User = require("../models/userModel.js");

const protectRoute = async (req, res, next) => {
  let token;

  // if the header includes a Bearer token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // get only the token string
      token = req.headers.authorization.split(" ")[1];

      // decode the token to get the corresponding user's id
      const decodedToken = jwt.verify(token, JWT_ACCESS_TOKEN_SECRET);

      // fetch that user = require( db, but not get the user's password and set this fetched user to the req.user
      req.user = await User.findById(decodedToken.id).select("-password");
      next();
    } catch (error) {
      console.log(error);
      res.status(401);
      throw new Error("Not authorised. Token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token available");
  }
};

const isAuthenticated = (req, res, next) => {
  let checker = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!checker) {
    return res.status(403).json({
      error: "ACCESS DENIED",
    });
  }
  next();
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) next();
  else {
    res.status(401);
    throw new Error("Not authorised admin");
  }
};

module.exports = { protectRoute, isAdmin, isAuthenticated };
