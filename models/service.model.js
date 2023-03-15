import mongoose from "mongoose";
import Product from "./schema/product.schema.js";

const ServiceSchema = new mongoose.Schema(
  {
    ...Product,
  },
  {timestamps: true}
);

ServiceSchema.methods.setLocation = function (latitude, longitude) {
  this.location = {
    type: "Point",
    coordinates: [longitude, latitude],
  };
};

ServiceSchema.methods.toAuthJSON = function () {
  return {
    owner: this.owner,
    name: this.name,
    status: this.status,
    province: this.province,
  };
};
ServiceSchema.methods.toProductJSON = function () {
  return {
    owner: this.owner,
    name: this.name,
    province: this.province,
    amphure: this.amphure,
    tambon: this.tambon,
    status: this.status,
    image: this.images[0],
    location_description: this.location_description,
    location: this.location,
    tags: this.petTags.concat(this.serviceTags),
    rating: this.rating,
    review_counts: this.review_counts,
    description: this.description || "",
    open_hours: this.open_hours,
  };
};
const Service = mongoose.model("Service", ServiceSchema);
export default Service;
