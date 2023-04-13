import dotenv from "dotenv";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import {uploadImage} from "../utils/gcs.utils.js";

dotenv.config({path: ".env"});

// @desc Change role of user to seller
// @route PATCH /user/setseller/:id
// @access Private
export const setSeller = async (req, res, next) => {
  const id = req.params.id;
  try {
    await User.findByIdAndUpdate(id, {isSeller: true});
    return res.json({
      id: id,
      message: "This user account has been set to be a seller",
    });
  } catch (err) {
    return res.status(500).json({message: err.message});
  }
};

// @desc Add or Update user info
// @route PATCH /user/info
// @access Private
export const addUserInfo = async (req, res, next) => {
  const id = req.body.id;
  console.log(req.body.id);
  try {
    let user = await User.findById(id);
    if (user == null) {
      res.status(404).json({message: "Cannot find user"});
    } else {
      const imageUri = req.file
        ? await uploadImage(req.file, process.env.GCS_PROFILE_BUCKET, id)
        : null;
      if (imageUri != null) user.image = imageUri;
      if (req.body.username != null) user.username = req.body.username;
      if (req.body.ownProducts != null) user.ownProducts = req.body.ownProducts;
      if (req.body.isSeller != null) user.isSeller = req.body.isSeller;
      if (req.body.firstName != null) user.firstName = req.body.firstName;
      if (req.body.lastName != null) user.lastName = req.body.lastName;
      if (req.body.phoneNumber != null) user.phoneNumber = req.body.phoneNumber;
      if (req.body.prefix != null) user.prefix = req.body.prefix;

      user
        .save()
        .then(function () {
          return res.send("Complete!");
        })
        .catch(function (error) {
          if (error.code === 11000) {
            return res.status(400).send({error: "Username already exists"});
          }
          next(error);
        });
    }
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

// @desc Get information of specific user
// @route POST /user/info
// @access Private
export const getUserInfo = async (req, res, next) => {
  const id = req.body.id;
  try {
    let user = await User.findById(id);
    if (user == null) {
      res.status(404).json({message: "Cannot find user"});
    } else {
      res.send(await user.getUserInfoJSON());
    }
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

// @desc Get user's information to display on Navbar
// @route GET /user/navbar
// @access Private
export const getNavbarInfo = async (req, res, next) => {
  try {
    const user = await User.findOne({_id: req.headers.user_id});
    return res.json(await user.getNavbarInfoJSON());
  } catch (err) {
    return res.status(500).json({message: err.message});
  }
};

// @desc Get favorite item of a user
// @route GET /user/save-for-later
// @access Private
export const getSaveForLater = async (req, res, next) => {
  const {user_id} = req.headers;
  try {
    const user = await User.findOne({_id: user_id}).populate({
      path: "saveForLater",
    });

    const transformedSaveForLater = await Promise.all(
      user.saveForLater.map(async (e) => {
        const product = await e.toProductJSON();
        product.isSaved = true;
        return product;
      })
    );
    return res.json(transformedSaveForLater);
  } catch (err) {
    return res.status(500).json({message: err.message});
  }
};

// @desc Update save for later on a list
// @route PATCH /user/save-for-later
// @access Private
export const addSaveForLater = async (req, res, next) => {
  const {user_id} = req.headers;
  const {productId} = req.body;

  let product = await Product.findById(productId);
  if (!product) {
    return res.status(404).send({
      error: "Product not found",
    });
  }

  try {
    const user = await User.findByIdAndUpdate(
      user_id,
      {$addToSet: {saveForLater: productId}},
      {new: true}
    );
    res
      .status(200)
      .json({message: `productId ${productId} added to save for later`});
  } catch (err) {
    return res.status(500).json({message: err.message});
  }
};

// @desc Delete save for later from a list
// @route DELETE /user/save-for-later
// @access Private
export const deleteSaveForLater = async (req, res, next) => {
  const {user_id} = req.headers;
  const {productId} = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      user_id,
      {$pull: {saveForLater: productId}},
      {new: true}
    );
    if (!user) {
      return res.status(404).json({message: "User not found"});
    }
    res
      .status(200)
      .json({message: `productId ${productId} deleted from save for later`});
  } catch (err) {
    return res.status(500).json({message: err.message});
  }
};
