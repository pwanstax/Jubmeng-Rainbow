import User from "../models/user.model.js";
import Clinic from "../models/clinic.model.js";
import Service from "../models/service.model.js";
import PetFriendly from "../models/petfriendly.model.js";
import {
  filterByOpen,
  makeCondition,
  sortProducts,
} from "../utils/product.utils.js";
export const createProduct = (req, res, next) => {
  const {
    owner,
    name,
    phones,
    socialNetworks,
    status,
    description,
    province,
    amphure,
    tambon,
    locationDescription,
    latitude,
    longitude,
    petTags,
    serviceTags,
    images,
    licenseID,
    openHours,
    placeType,
    rating,
    reviewCounts,
    prices,
    manualCose,
  } = req.body.product;

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

  if (owner) product.owner = owner;
  if (name) product.name = name;
  if (phones) product.phones = phones;
  if (socialNetworks) product.socialNetworks = socialNetworks;
  if (status) product.status = status;
  if (description) product.description = description;
  if (province) product.province = province;
  if (amphure) product.amphure = amphure;
  if (tambon) product.tambon = tambon;
  if (locationDescription) product.locationDescription = locationDescription;
  if (latitude && longitude) product.setLocation(latitude, longitude);
  if (images) product.images = images;
  if (petTags) product.petTags = petTags;
  if (serviceTags) product.serviceTags = serviceTags;
  if (licenseID) product.licenseID = licenseID;
  if (openHours) product.setOpenHours(openHours);
  if (rating) product.rating = rating;
  if (reviewCounts) product.reviewCounts = reviewCounts;
  if (prices) product.prices = prices;
  if (type == "petfriendly" && placeType) product.placeType = placeType;
  if (manualCose) product.manualCose = manualCose;

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

export const getEachProducts = async (req, res, next) => {
  let Product;
  const type = req.params.type;
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
