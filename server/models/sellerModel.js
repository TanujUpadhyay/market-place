import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const SellerSchema = mongoose.Schema(
  {
    businessName: {
      type: String,
      required: true,
    },
    brandOwnerName: {
      type: String,
      required: true,
    },
    businessDescription: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      require: true,
    },
    password: {
      type: String,
      required: true,
    },
    pickUpAddress: {
      type: String,
      required: true,
    },
    brandZipCode: {
      type: String,
      required: true,
    },
    brandContact: {
      type: number,
      required: true,
    },
    contactDetails: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
    isConfirmed: {
      type: Boolean,
      required: true,
      default: false,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// function to check of passwords are matching
SellerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// encrypt password before saving
SellerSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(user.password, salt);
  user.password = hash;
  next();
});

const Seller = mongoose.model("Seller", SellerSchema);

export default Seller;
