import mongoose from "mongoose";
import Product from "./schema/product.schema.js";
import {
  formatOpenHours,
  checkOpenOrClose,
  mapServiceTagIcon,
} from "./schema/product.schema.js";
const PetFriendlySchema = new mongoose.Schema(
  {
    ...Product,
    place_type: {
      type: String,
    },
  },
  {timestamps: true}
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
    open_hours: formatOpenHours(this.open_hours),
  };
};

PetFriendlySchema.methods.toProductJSON = function () {
  return {
    id: this._id,
    owner: this.owner,
    name: this.name,
    province: this.province,
    amphure: this.amphure,
    tambon: this.tambon,
    status: this.status,
    image: this.images[0],
    location_description: this.location_description,
    location: this.location,
    tags: mapServiceTagIcon(this.serviceTags),
    rating: this.rating,
    review_counts: this.review_counts,
    description: this.description || "",
    open_hours: formatOpenHours(this.open_hours),
    place_type: this.place_type || "",
    todayCloseAt: checkOpenOrClose(this.open_hours, this.manual_close)[1],
  };
};

PetFriendlySchema.methods.toProductDetailJSON = function () {
  return {
    owner: this.owner,
    name: this.name,
    phones: this.phones,
    social_networks: this.social_networks,
    province: this.province,
    amphure: this.amphure,
    tambon: this.tambon,
    status: this.status,
    images: this.images,
    location_description: this.location_description,
    location: this.location,
    tags: mapServiceTagIcon(this.serviceTags),
    rating: this.rating,
    review_counts: this.review_counts,
    description: this.description || "",
    open_hours: formatOpenHours(this.open_hours),
    prices: this.prices,
    place_type: this.place_type || "",
    open_status: checkOpenOrClose(this.open_hours, this.manual_close)[0],
    todayCloseAt: checkOpenOrClose(this.open_hours, this.manual_close)[1],
  };
};

const PetFriendly = mongoose.model("PetFriendly", PetFriendlySchema);
export default PetFriendly;
