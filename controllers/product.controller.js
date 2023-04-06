import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import {uploadImage, getImageUrl, deleteImage} from "../utils/gcs.utils.js";
import {
  serviceTags,
  petTags,
  filterByOpen,
  makeCondition,
  sortProducts,
  setFavorited,
} from "../helpers/product.helpers.js";

import {ObjectId} from "bson";

// @desc Create product
// @route POST /product
// @access Private -> seller, admin
export const createProduct = async (req, res, next) => {
  let {
    owner,
    name,
    phones,
    facebook,
    instagram,
    lineID,
    twitter,
    status = "Pending",
    description,
    province,
    amphure,
    tambon,
    locationDescription,
    latitude,
    longitude,
    petTags,
    serviceTags,
    licenseID,
    openHours,
    placeType,
    rating = 0,
    reviewCounts,
    prices,
    manualClose,
  } = req.body;
  let product = new Product();

  //for case list has only one element
  if (phones && typeof phones != "object") phones = [phones];
  if (petTags && typeof petTags != "object") petTags = [petTags];
  if (serviceTags && typeof serviceTags != "object")
    serviceTags = [serviceTags];
  if (openHours && typeof openHours != "object") openHours = [openHours];
  if (prices && typeof prices != "object") prices = [prices];

  let socialNetworks = {};
  if (lineID) socialNetworks.lineID = lineID;
  if (facebook) socialNetworks.facebook = facebook;
  if (instagram) socialNetworks.instagram = instagram;
  if (twitter) socialNetworks.twitter = twitter;

  const id = req.body.owner_user_id;
  const productId = new ObjectId();

  const images = req.files["images"];
  const imageUris = [];
  for (const image of images) {
    const imageUri = await uploadImage(
      image,
      process.env.GCS_MERCHANT_IMAGES_BUCKET,
      `${id}/${productId}`,
      null
    );
    imageUris.push(imageUri);
  }

  product._id = productId;
  if (owner) product.owner = owner;
  if (name) product.name = name;
  if (phones) product.phones = phones;
  if (Object.keys(socialNetworks).length)
    product.socialNetworks = socialNetworks;
  if (status) product.status = status;
  if (description) product.description = description;
  if (province) product.province = province;
  if (amphure) product.amphure = amphure;
  if (tambon) product.tambon = tambon;
  if (locationDescription) product.locationDescription = locationDescription;
  if (latitude && longitude) product.setLocation(latitude, longitude);
  if (imageUris.length) product.images = imageUris;
  if (petTags) product.petTags = petTags;
  if (serviceTags) product.serviceTags = serviceTags;
  if (licenseID) product.licenseID = licenseID;
  if (openHours) product.setOpenHours(openHours.map((e) => JSON.parse(e)));
  if (rating) product.rating = rating;
  if (reviewCounts) product.reviewCounts = reviewCounts;
  if (prices) product.prices = prices.map((e) => JSON.parse(e));
  if (placeType) product.placeType = placeType;
  if (manualClose) product.manualClose = manualClose;

  product
    .save()
    .then(function () {
      return res.json(product.confirmProductInfo());
    })
    .catch(function (error) {
      if (error.code === 11000) {
        return res.status(400).send({
          error: "licenseID already exists",
        });
      }
      next(error);
    });
};

// @desc Get all products
// @route GET /products
// @access Public
export const getProducts = async (req, res, next) => {
  let condition = {};
  let user_id = req.headers.user_id;

  try {
    condition = makeCondition(
      req.query.name,
      req.query.petTags,
      req.query.serviceTags
    );
  } catch (err) {
    return res.status(500).json({message: err.message});
  }

  try {
    let products = await filterByOpen(
      Product,
      condition,
      req.query.latitude,
      req.query.longitude
    );

    products = sortProducts(products, req.query.sort);

    products = await setFavorited(user_id, products);

    return res.json(products);
  } catch (err) {
    return res.status(500).json({message: err.message});
  }
};

// @desc Get the information of specific product
// @route GET /product/:id
// @access Public
export const getProductInfo = async (req, res, next) => {
  const id = req.params.id;
  try {
    const product = await Product.findById(id);
    return res.json(await product.toProductDetailJSON());
  } catch (err) {
    return res.status(500).json({message: err.message});
  }
};

// @desc Get all products of a seller
// @route GET /products/me/:username
// @access Private -> seller, admin
export const getMyProducts = async (req, res, next) => {
  const username = req.params.username;
  try {
    const condition = makeCondition(null, null, null, {
      owner: username,
    });
    const myProducts = await Product.find(condition);
    const transformedProducts = await Promise.all(
      myProducts.map(async (e) => {
        const product = await e.toProductJSON();
        return product;
      })
    );
    res.send({
      myProducts: transformedProducts,
    });
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

// @desc Get all Tags of product
// @route GET /products/tags
// @access Public
export const getTags = (req, res, next) => {
  return res.json({
    petTags: petTags,
    serviceTags: serviceTags,
  });
};

// @desc Delete specific product
// @route DELETE /product/:id
// @access Private [owner]
export const deleteProduct = async (req, res, next) => {
  const id = req.params.id;
  const owner = req.body.owner; //username
  try {
    const product = await Product.findById(id);
    if (product && product.owner === owner) {
      //delete in gcs
      const imagesToRemove = product.images;
      for (const image of imagesToRemove) {
        await deleteImage(process.env.GCS_MERCHANT_IMAGES_BUCKET, "", image);
      }
      //delete product in mongo
      await Product.deleteOne({_id: id});
      return res.json({message: "deleted"});
    }
    return res.status(401).json({message: "Must be owner to delete"});
  } catch (err) {
    return res.status(500).json({message: err.message});
  }
};
