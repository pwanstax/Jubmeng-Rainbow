import mongoose from "mongoose";
import crypto from "crypto";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import {getImageUrl} from "../utils/gcs.utils.js";
dotenv.config({path: ".env"});

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
      default: "default.png",
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

UserSchema.methods.getNavbarInfoJSON = async function () {
  const imageUrl = await getImageUrl(
    process.env.GCS_PROFILE_BUCKET,
    this.image
  );
  return {
    username: this.username,
    user_id: this._id,
    image: imageUrl,
    isLessor: this.isSeller,
  };
};

UserSchema.methods.getSaveForLater = function () {
  return {
    saveForLater: this.saveForLater,
    count: this.saveForLater.length,
  };
};

UserSchema.methods.getUserInfoJSON = async function () {
  const imageUrl = await getImageUrl(
    process.env.GCS_PROFILE_BUCKET,
    this.image
  );
  return {
    username: this.username,
    email: this.email,
    firstName: this.firstName,
    lastName: this.lastName,
    phoneNumber: this.phoneNumber,
    prefix: this.prefix,
    ownProducts: this.ownProducts,
    image: imageUrl,
  };
};

const User = mongoose.model("User", UserSchema);
export default User;
