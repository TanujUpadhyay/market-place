const {
  JWT_REFRESH_TOKEN_SECRET,
  JWT_EMAIL_TOKEN_SECRET,
  JWT_FORGOT_PASSWORD_TOKEN_SECRET,
} = require("../../config");
const Token = require("../models/tokenModel");
const User = require("../models/userModel");
const generateToken = require("../utils/generateToken");
const { consoleLogger } = require("../utils/helper");
const sendMail = require("../utils/sendMail");

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
      await sendMail(user._id, email, "email verification");

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

const authUser = async (req, res, next) => {
  try {
    const { contact, password } = req.body;

    let user = await User.findOne({ contact });
    if (!user) throw new Error("User not found");
    // generate both the access and the refresh tokens
    const accessToken = generateToken(user._id, "access");
    const refreshToken = generateToken(user._id, "refresh");

    // if the passwords are matching, then check if a refresh token exists for this user
    if (user && (await user.matchPassword(password))) {
      const existingToken = await Token.findOne({ contact });
      // if no refresh token available, create one and store it in the db
      if (!existingToken) {
        const newToken = await Token.create({
          contact,
          token: refreshToken,
        });
      } else {
        existingToken.token = refreshToken;
        existingToken.save();
      }

      res.json({
        id: user._id,
        email: user.email,
        contact: user.contact,
        name: user.name,
        isAdmin: user.isAdmin,
        avatar: user.avatar,
        accessToken,
        refreshToken,
      });
    } else {
      res.status(401);
      throw new Error(user ? "Invalid Password" : "Invalid email");
    }
  } catch (error) {
    consoleLogger(error);
    res.status(403);
    next(error);
  }
};

const getAccessToken = async (req, res, next) => {
  try {
    const refreshToken = req.body.token;
    const contact = req.body.contact;

    // search if currently loggedin user has the refreshToken sent
    const currentAccessToken = await Token.findOne({ contact });

    if (!refreshToken || refreshToken !== currentAccessToken.token) {
      res.status(400);
      throw new Error("Refresh token not found, login again");
    }

    // If the refresh token is valid, create a new accessToken and return it.
    jwt.verify(refreshToken, JWT_REFRESH_TOKEN_SECRET, (err, user) => {
      if (!err) {
        const accessToken = generateToken(user.id, "access");
        return res.json({ success: true, accessToken });
      } else {
        return res.json({
          success: false,
          message: "Invalid refresh token",
        });
      }
    });
  } catch (error) {
    consoleLogger(error);
    res.status(403);
    next(error);
  }
};

const confirmUser = async (req, res, next) => {
  try {
    // set the user to a confirmed status, once the corresponding JWT is verified correctly
    const emailToken = req.params.token;
    const decodedToken = jwt.verify(emailToken, JWT_EMAIL_TOKEN_SECRET);
    const user = await User.findById(decodedToken.id).select("-password");
    user.isConfirmed = true;
    const updatedUser = await user.save();
    const foundToken = await Token.findOne({ email: updatedUser.email }); // send the refresh token that was stored
    res.json({
      id: updatedUser._id,
      email: updatedUser.email,
      name: updatedUser.name,
      isAdmin: updatedUser.isAdmin,
      avatar: updatedUser.avatar,
      isConfirmed: updatedUser.isConfirmed,
      accessToken: generateToken(user._id, "access"),
      refreshToken: foundToken,
    });
  } catch (error) {
    consoleLogger(error);
    res.status(401);
    next(error);
  }
};

const mailForEmailVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    // console.log(user);
    if (user) {
      // send a verification email, if this user is not a confirmed email
      if (!user.isConfirmed) {
        // send the mail
        await sendMail(user._id, email, "email verification");
        res.status(201).json({
          id: user._id,
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
          avatar: user.avatar,
          isConfirmed: user.isConfirmed,
        });
      } else {
        res.status(400);
        throw new Error("User already confirmed");
      }
    }
  } catch (error) {
    consoleLogger(error);
    res.status(401);
    next(error);
  }
};

const mailForPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // send a link to reset password only if it's a confirmed account
    if (user && user.isConfirmed) {
      // send the mail and return the user details

      // the sendMail util function takes a 3rd argument to indicate what type of mail to send
      await sendMail(user._id, email, "forgot password");

      res.status(201).json({
        id: user._id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        avatar: user.avatar,
        isConfirmed: user.isConfirmed,
      });
    }
  } catch (error) {
    consoleLogger(error);
    res.status(401);
    next(error);
  }
};

const resetUserPassword = async (req, res, next) => {
  try {
    // update the user password if the jwt is verified successfully
    const { passwordToken, password } = req.body;
    const decodedToken = jwt.verify(
      passwordToken,
      JWT_FORGOT_PASSWORD_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken.id);

    if (user && password) {
      user.password = password;
      const updatedUser = await user.save();

      if (updatedUser) {
        res.status(200).json({
          id: updatedUser._id,
          email: updatedUser.email,
          name: updatedUser.name,
          avatar: updatedUser.avatar,
          isAdmin: updatedUser.isAdmin,
        });
      } else {
        res.status(401);
        throw new Error("Unable to update password");
      }
    }
  } catch (error) {
    consoleLogger(error);
    res.status(400);
    next(error);
  }
};

module.exports = {
  getAllUsers,
  registerUser,
  deleteUser,
  getUserById,
  updateUserById,
  authUser,
  getAccessToken,
  confirmUser,
  mailForEmailVerification,
  mailForPasswordReset,
  resetUserPassword,
};
