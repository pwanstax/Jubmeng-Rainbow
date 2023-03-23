import mongoose from "mongoose";
import crypto from "crypto";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config({ path: ".env" });

const secret = process.env.JWT_SECRET;

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      match: [
        /^(?=.{1,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/,
        "is invalid",
      ],
      index: true,
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      match: [/\S+@\S+\.\S+/, "is invalid"],
      index: true,
    },
    image: {
      type: String,
      default: "https://storage.cloud.google.com/jubmeng-profile/default.png",
    },
    ownProducts: {
      type: [String],
      default: [],
    },
    prefix: {
      type: String,
      default: "",
    },
    firstName: {
      type: String,
      default: "",
    },
    lastName: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: String,
      default: "",
    },
    isSeller: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      required: [true, "can't be blank"],
      default: 5,
      min: 0,
      max: 5,
    },
    saveForLater: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Clinic",
        },
      ],
      default: [],
    },
    hash: String,
    salt: String,
  },
  { timestamps: true }
);

UserSchema.methods.validPassword = function (password) {
  var hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
    .toString("hex");
  return this.hash === hash;
};

UserSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
    .toString("hex");
};

UserSchema.methods.generateJWT = function () {
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign(
    {
      id: this._id,
      username: this.username,
      exp: parseInt(exp.getTime() / 1000),
    },
    secret
  );
};

UserSchema.methods.toAuthJSON = function () {
  return this.generateJWT();
};
UserSchema.methods.getIdJSON = function () {
  return {
    user_id: this._id,
    username: this.username,
  };
};

UserSchema.methods.getNavbarJSON = function () {
  return {
    username: this.username,
    user_id: this._id,
    image: this.image,
    isLessor: this.isSeller,
  };
};

UserSchema.methods.getSaveForLater = function () {
  return {
    saveForLater: this.saveForLater,
    count: this.saveForLater.length,
  };
};

const User = mongoose.model("User", UserSchema);
export default User;
