import Review from "../models/review.model.js";
import Product from "../models/product.model.js";

// @desc Create a review
// @route POST /review
// @access Private -> seller, admin
export const createReview = async (req, res, next) => {
  const review = new Review();
  const {reviewerID, productID, comment, rating} = req.body.review;
  if (reviewerID) review.reviewerID = reviewerID;
  if (comment) review.comment = comment;
  if (rating) review.rating = rating;

  let product = await Product.findById(productID);
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
// @route POST /review/:id
// @access Public
export const getReviews = async (req, res, next) => {
  let condition = {};
  if (req.params.id) condition.productID = req.params.id;

  try {
    let reviews = await Review.find(condition).populate("reviewerID");
    reviews.sort(function (a, b) {
      return b.rating - a.rating;
    });
    const sortedReviews = await Review.sortReviews(reviews, req.query.sort);
    const sendReviews = sortedReviews.map((e) => e.toProductDetailJSON());
    const ratingCount = await Review.aggregate([
      {$group: {_id: "$rating", count: {$sum: 1}}},
      {$project: {_id: 0, rating: "$_id", count: 1}},
    ]);
    console.log(ratingCount);
    return res.json({reviews: sendReviews, ratingCount: ratingCount});
  } catch (err) {
    return res.status(500).json({message: err.message});
  }
};

// @desc Get specific review
// @route POST /review-info/:id
// @access Private
export const getReviewInfo = async (req, res, next) => {
  const {id} = req.params;
  try {
    const review = await Review.findById(id);
    return res.json({review: review.toProductDetailJSON()});
  } catch (err) {
    return res.status(500).json({message: err.message});
  }
};
