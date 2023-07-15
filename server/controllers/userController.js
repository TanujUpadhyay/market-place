const User = require("../models/userModel");
const generateToken = require("../utils/generateToken");
const { consoleLogger } = require("../utils/helper");

const getAllUsers = async (req, res, next) => {
  try {
    const page = Number(req.query.pageNumber) || 1; // the current page number in the pagination
    const pageSize = 20; // total number of entries on a single page
    const count = await User.countDocuments({}); // total number of documents available
    // const count = await Order.countDocuments({}); // total number of documents available

    // find all orders that need to be sent for the current page, by skipping the documents included in the previous pages
    // and limiting the number of documents included in this request
    // sort this in desc order that the document was created at
    const allUsers = await User.find({})
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort("-createdAt")
      .select("-password");

    // send the list of orders, current page number, total number of pages available
    res.json({
      users: allUsers,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    consoleLogger(error);
    res.status(403);
    next(error);
  }
};

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, contact, userinfo, avatar, address } =
      req.body;

    const userExists = await User.findOne({ contact });
    if (userExists) {
      res.status(400);
      throw new Error("This Phone no is already registered");
    }

    const user = await User.create({
      name,
      email,
      password,
      avatar,
      contact,
      userinfo,
      address,
    });

    if (user) {
      // send a mail for email verification of the newly registred email id
      // await sendMail(user._id, email, "email verification");

      const refreshToken = generateToken(user._id, "refresh");
      res.status(201).json({
        id: user._id,
        email: user.email,
        name: user.name,
        avatar,
        isAdmin: user.isAdmin,
        isConfirmed: user.isConfirmed,
        accessToken: generateToken(user._id, "access"),
        refreshToken,
      });
    } else {
      res.status(400);
      throw new Error("User not created");
    }
  } catch (error) {
    consoleLogger(error);
    res.status(403);
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (user) res.json(user);
    else {
      res.status(404);
      throw new Error("User does not exist");
    }
  } catch (error) {
    consoleLogger(error);
    res.status(403);
    next(error);
  }
};

const updateUserById = async (req, res, next) => {
  try {
    // do not include the hashed password when fetching this user
    const user = await User.findById(req.params.id).select("-password");
    if (user) {
      // update whicever field was sent in the rquest body
      user.name = req.body.name || user.name;
      user.isConfirmed = req.body.email === user.email;
      user.email = req.body.email || user.email;
      const updatedUser = await user.save();
      if (updatedUser) {
        res.json({
          id: updatedUser._id,
          email: updatedUser.email,
          name: updatedUser.name,
          isAdmin: updatedUser.isAdmin,
        });
      }
    } else {
      res.status(400);
      throw new Error("User not found.");
    }
  } catch (error) {
    consoleLogger(error);
    res.status(403);
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.remove();
      res.json({
        message: "User removed from DB",
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    consoleLogger(error);
    res.status(403);
    next(error);
  }
};

module.exports = {
  getAllUsers,
  registerUser,
  deleteUser,
  getUserById,
  updateUserById,
};
