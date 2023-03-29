import User from "../models/user.model.js";
import Clinic from "../models/clinic.model.js";
import Service from "../models/service.model.js";
import PetFriendly from "../models/petfriendly.model.js";
import {uploadImage} from "../utils/gcs.utils.js";
import {serviceTags, petTags} from "../models/schema/product.schema.js";
import {ObjectId} from "bson";
import {
  filterByOpen,
  makeCondition,
  sortProducts,
} from "../utils/product.utils.js";

// @desc Create product
// @route POST /product/:type
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
  const type = req.params.type;
  let product;
  if (type == "clinic") product = new Clinic();
  else if (type == "service") product = new Service();
  else if (type == "petfriendly") product = new PetFriendly();
  else {
    return res.status(500).json({
      message:
        "request parameter must be 'clinic' or 'service' or 'petfriendly'",
    });
  }
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
      process.env.GCS_PROFILE_BUCKET,
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
  if (type == "petfriendly" && placeType) product.placeType = placeType;
  if (manualClose) product.manualClose = manualClose;

  product
    .save()
    .then(function () {
      return res.json({product: product.toAuthJSON()});
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

// @desc Get all products for specific type
// @route GET /products/:type
// @access Public
export const getEachProducts = async (req, res, next) => {
  let Product;
  const type = req.params.type;
  console.log("inhere");
  if (type == "clinic") Product = Clinic;
  else if (type == "service") Product = Service;
  else if (type == "petfriendly") {
    Product = PetFriendly;
  } else {
    return res.status(500).json({
      message:
        "request parameter must be 'clinic' or 'service' or 'petfriendly'",
    });
  }

  let condition = {};
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
    return res.json(products);
  } catch (err) {
    return res.status(500).json({message: err.message});
  }
};

// @desc Get all products for all type
// @route GET /products
// @access Public
export const getProducts = async (req, res, next) => {
  let condition = {};
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
    const clinics = await filterByOpen(
      Clinic,
      condition,
      req.query.latitude,
      req.query.longitude
    );
    const services = await filterByOpen(
      Service,
      condition,
      req.query.latitude,
      req.query.longitude
    );
    const petfriendlies = await filterByOpen(
      PetFriendly,
      condition,
      req.query.latitude,
      req.query.longitude
    );

    let products = clinics.concat(services, petfriendlies);
    products = sortProducts(products, req.query.sort);
    return res.json(products);
  } catch (err) {
    return res.status(500).json({message: err.message});
  }
};

// @desc Get the information of specific product
// @route GET /product/:type/:id
// @access Public
export const getProductInfo = async (req, res, next) => {
  let Product;
  const type = req.params.type;
  const id = req.params.id;
  if (type == "clinic") Product = Clinic;
  else if (type == "service") Product = Service;
  else if (type == "petfriendly") Product = PetFriendly;
  else {
    return res.status(500).json({
      message:
        "request parameter must be 'clinic' or 'service' or 'petfriendly'",
    });
  }
  try {
    const product = await Product.findById(id);
    return res.json(product.toProductDetailJSON());
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
    let petFriendly = await PetFriendly.find(condition);
    let clinic = await Clinic.find(condition);
    let service = await Service.find(condition);

    const myProducts = [...petFriendly, ...clinic, ...service];
    const withType = myProducts.map((e) => {
      const product = e.toProductJSON();
      product.type = e.constructor.modelName.toLowerCase();
      return product;
    });

    res.send({
      myProducts: withType,
    });
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

export const getTags = (req, res, next) => {
  const type = req.params.type;
  if (type != "clinic" && type != "service" && type != "petfriendly") {
    return res.status(500).json({
      message:
        "request parameter must be 'clinic' or 'service' or 'petfriendly'",
    });
  }
  return res.json({
    petTags: petTags,
    serviceTags: serviceTags[type],
  });
};
