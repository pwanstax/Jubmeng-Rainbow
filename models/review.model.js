import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    reviewerID: {
      type: mongoose.ObjectId,
      ref: "User",
      required: [true, "can't be blank"],
    },
    productType: {
      type: String,
      enum: ["clinic", "service", "petfriendly"],
      required: [true, "can't be blank"],
    },
    clinicID: {
      type: mongoose.ObjectId,
      ref: "Clinic",
    },
    serviceID: {
      type: mongoose.ObjectId,
      ref: "Service",
    },
    petFriendlyID: {
      type: mongoose.ObjectId,
      ref: "PetFriendly",
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
    productType: this.productType,
    clinicID: this.clinicID || "",
    serviceID: this.serviceID || "",
    petFriendlyID: this.petFriendlyID || "",
    comment: this.comment,
    rating: this.rating,
  };
};
ReviewSchema.methods.toProductDetailJSON = function () {
  return {
    reviewer: this.reviewerID.username,
    reviewerImg: this.reviewerID.image,
    productType: this.productType,
    clinicID: this.clinicID || "",
    serviceID: this.serviceID || "",
    petFriendlyID: this.petFriendlyID || "",
    comment: this.comment,
    rating: this.rating,
  };
};
const Review = mongoose.model("Review", ReviewSchema);
export default Review;
