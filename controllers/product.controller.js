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
    social_networks,
    status,
    description,
    province,
    amphure,
    tambon,
    location_description,
    latitude,
    longitude,
    petTags,
    serviceTags,
    images,
    license_id,
    open_hours,
    place_type,
    rating,
    review_counts,
    prices,
    manual_close,
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
  if (social_networks) product.social_networks = social_networks;
  if (status) product.status = status;
  if (description) product.description = description;
  if (province) product.province = province;
  if (amphure) product.amphure = amphure;
  if (tambon) product.tambon = tambon;
  if (location_description) product.location_description = location_description;
  if (latitude && longitude) product.setLocation(latitude, longitude);
  if (images) product.images = images;
  if (petTags) product.petTags = petTags;
  if (serviceTags) product.serviceTags = serviceTags;
  if (license_id) product.license_id = license_id;
  if (open_hours) product.setOpenHours(open_hours);
  if (rating) product.rating = rating;
  if (review_counts) product.review_counts = review_counts;
  if (prices) product.prices = prices;
  if (type == "petfriendly" && place_type) product.place_type = place_type;
  if (manual_close) product.manual_close = manual_close;

  product
    .save()
    .then(function () {
      return res.json({product: product.toAuthJSON()});
    })
    .catch(function (error) {
      if (error.code === 11000) {
        return res.status(400).send({
          error: "license_id already exists",
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
