import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    reviewerID: {
      type: mongoose.ObjectId,
      ref: "User",
      required: [true, "can't be blank"],
    },
    productID: {
      type: mongoose.ObjectId,
      ref: "Product",
    },
    comment: {
      type: String,
      required: [true, "can't be blank"],
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      required: [true, "can't be blank"],
    },
  },
  {timestamps: true}
);

ReviewSchema.methods.toAuthJSON = function () {
  return {
    reviewerID: this.reviewerID,
    productID: this.productID || "",
    comment: this.comment,
    rating: this.rating,
  };
};
ReviewSchema.methods.toProductDetailJSON = function () {
  const options = {day: "numeric", month: "long", year: "numeric"};
  return {
    reviewer: this.reviewerID.username,
    reviewerImg: this.reviewerID.image,
    productID: this.productID || "",
    comment: this.comment,
    rating: this.rating,
    createdAtDateTime: this.createdAt,
    createdAt: this.createdAt.toLocaleDateString("en-US", options),
  };
};

ReviewSchema.statics.sortReviews = function (reviews, reqSort) {
  if (reqSort == "lowest_rating") {
    reviews.sort((a, b) => (a.rating < b.rating ? -1 : 1));
  } else if (reqSort == "highest_rating") {
    reviews.sort((a, b) => (a.rating > b.rating ? -1 : 1));
  } else if (reqSort == "oldest") {
    reviews.sort((a, b) =>
      new Date(a.createdAtDateTime) < new Date(b.createdAtDateTime) ? -1 : 1
    );
  } else if (reqSort == "newest") {
    reviews.sort((a, b) =>
      new Date(a.createdAtDateTime) > new Date(b.createdAtDateTime) ? -1 : 1
    );
  }
  return reviews;
};

const Review = mongoose.model("Review", ReviewSchema);
export default Review;
