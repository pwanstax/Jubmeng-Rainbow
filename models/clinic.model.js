import mongoose from "mongoose";
import Product from "./schema/product.schema.js";

const ClinicSchema = new mongoose.Schema(
  {
    ...Product,
  },
  { timestamps: true }
);

ClinicSchema.methods.setLocation = function (latitude, longitude) {
  this.location = {
    type: "Point",
    coordinates: [longitude, latitude],
  };
};

ClinicSchema.methods.toAuthJSON = function () {
  return {
    owner: this.owner,
    name: this.name,
    status: this.status,
    province: this.province,
  };
};

const Clinic = mongoose.model("Clinic", ClinicSchema);
export default Clinic;
