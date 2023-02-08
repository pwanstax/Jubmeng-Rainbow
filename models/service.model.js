import mongoose from "mongoose";
import Product from "./schema/product.schema.js";

const ServiceSchema = new mongoose.Schema(
  {
    ...Product,
  },
  { timestamps: true }
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

const Service = mongoose.model("Service", ServiceSchema);
export default Service;
