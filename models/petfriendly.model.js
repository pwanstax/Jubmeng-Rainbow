import mongoose from "mongoose";
import Product from "./schema/product.schema.js";

const PetFriendlySchema = new mongoose.Schema(
  {
    ...Product,
    place_type: {
      type: String,
    },
  },
  { timestamps: true }
);

PetFriendlySchema.methods.setLocation = function (latitude, longitude) {
  this.location = {
    type: "Point",
    coordinates: [longitude, latitude],
  };
};

PetFriendlySchema.methods.toAuthJSON = function () {
  return {
    owner: this.owner,
    name: this.name,
    status: this.status,
    province: this.province,
  };
};

const PetFriendly = mongoose.model("PetFriendly", PetFriendlySchema);
export default PetFriendly;
