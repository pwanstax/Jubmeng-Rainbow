import Review from "../models/review.model.js";
import Clinic from "../models/clinic.model.js";
import Service from "../models/service.model.js";
import PetFriendly from "../models/petfriendly.model.js";

// @desc Create a review
// @route POST /review
// @access Private -> seller, admin
export const createReview = async (req, res, next) => {
  const review = new Review();
  const {
    reviewerID,
    productType,
    clinicID,
    serviceID,
    petFriendlyID,
    comment,
    rating,
  } = req.body.review;
  if (reviewerID) review.reviewerID = reviewerID;
  if (productType) review.productType = productType;
  if (clinicID) review.clinicID = clinicID;
  if (serviceID) review.serviceID = serviceID;
  if (petFriendlyID) review.petFriendlyID = petFriendlyID;
  if (comment) review.comment = comment;
  if (rating) review.rating = rating;

  let Product;
  let findID;
  if (productType == "clinic") {
    Product = Clinic;
    findID = clinicID;
  } else if (productType == "service") {
    Product = Service;
    findID = serviceID;
  } else if (productType == "petfriendly") {
    Product = PetFriendly;
    findID = petFriendlyID;
  }

  let product = await Product.findById(findID);
  if (!product) {
    return res.status(404).send({
      error: "Product not found",
    });
  }
  if (product.reviewCounts > 0) {
    product.rating =
      (product.rating * product.reviewCounts + rating) /
      (product.reviewCounts + 1);
  } else {
    product.rating = rating;
  }
  product.reviewCounts = product.reviewCounts + 1;
  try {
    await review.save();
    await product.save();
    return res.json({review: review.toAuthJSON()});
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).send({
        error: "licenseID already exists",
      });
    }
    next(error);
  }
};

// @desc Get all reviews
// @route POST /review
// @access Public
export const getReviews = async (req, res, next) => {
  let condition = {};
  const type = req.params.type;
  if (type == "clinic") {
    if (req.query.id) condition.clinicID = req.query.id;
  } else if (type == "service") {
    if (req.query.id) condition.serviceID = req.query.id;
  } else if (type == "petfriendly") {
    if (req.query.id) condition.petFriendlyID = req.query.id;
  } else {
    return res.status(500).json({
      message:
        "request parameter must be 'clinic' or 'service' or 'petfriendly'",
    });
  }
  condition.productType = type;
  try {
    let reviews = await Review.find(condition).populate("reviewerID");
    reviews.sort(function (a, b) {
      return b.rating - a.rating;
    });
    const sortedReviews = await Review.sortReviews(reviews, req.query.sort);
    const sendReviews = sortedReviews.map((e) => e.toProductDetailJSON());
    return res.json({reviews: sendReviews});
  } catch (err) {
    return res.status(500).json({message: err.message});
  }
};

export const getReviewInfo = async (req, res, next) => {
  const {id} = req.params;
  try {
    const review = await Review.findById(id);
    return res.json({review: review.toProductDetailJSON()});
  } catch (err) {
    return res.status(500).json({message: err.message});
  }
};
