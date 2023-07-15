const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    contact: {
      type: Number,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    userinfo: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
    },
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    address: [
      {
        name: { type: String },
        address: { type: String },
        city: { type: String },
        postalCode: { type: String },
        country: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// function to check of passwords are matching
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// encrypt password before saving
userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(user.password, salt);
  user.password = hash;
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
