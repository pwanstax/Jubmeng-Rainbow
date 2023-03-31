import mongoose from "mongoose";
import {getImageUrl} from "../utils/gcs.utils.js";
import Product from "./schema/product.schema.js";
import {
  formatOpenHours,
  checkOpenOrClose,
  mapServiceTagIcon,
} from "./schema/product.schema.js";
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

ServiceSchema.methods.setOpenHours = function (openHours) {
  let newOpenHours = openHours;

  for (const day of newOpenHours) {
    for (let e of day.periods) {
      const openTimes = e.openAt.split(":");
      e.openAt = parseInt(openTimes[0]) * 60 + parseInt(openTimes[1]);

      const closeTimes = e.closeAt.split(":");
      e.closeAt = parseInt(closeTimes[0]) * 60 + parseInt(closeTimes[1]);
    }
  }
  this.openHours = newOpenHours;
};

ServiceSchema.methods.toAuthJSON = function () {
  return {
    owner: this.owner,
    name: this.name,
    status: this.status,
    province: this.province,
    openHours: formatOpenHours(this.openHours),
  };
};

ServiceSchema.methods.toProductJSON = function () {
  return {
    id: this._id,
    owner: this.owner,
    name: this.name,
    province: this.province,
    amphure: this.amphure,
    tambon: this.tambon,
    status: this.status,
    image: this.images[0],
    locationDescription: this.locationDescription,
    location: this.location,
    tags: mapServiceTagIcon(this.serviceTags),
    rating: this.rating,
    reviewCounts: this.reviewCounts,
    description: this.description || "",
    openHours: formatOpenHours(this.openHours),
    openStatusTimeDetail: checkOpenOrClose(this.openHours, this.manualClose)[1],
  };
};

ServiceSchema.methods.toProductDetailJSON = async function () {
  let imageUrls = [];
  for (const image of this.images) {
    let imageUrl = await getImageUrl(
      process.env.GCS_MERCHANT_IMAGES_BUCKET,
      null,
      image
    );
    imageUrls.push(imageUrl);
  }
  return {
    owner: this.owner,
    name: this.name,
    phones: this.phones,
    socialNetworks: this.socialNetworks,
    province: this.province,
    amphure: this.amphure,
    tambon: this.tambon,
    status: this.status,
    images: imageUrls,
    locationDescription: this.locationDescription,
    location: this.location,
    tags: mapServiceTagIcon(this.serviceTags),
    rating: this.rating,
    reviewCounts: this.reviewCounts,
    description: this.description || "",
    openHours: formatOpenHours(this.openHours),
    prices: this.prices,
    openStatus: checkOpenOrClose(this.openHours, this.manualClose)[0],
    openStatusTimeDetail: checkOpenOrClose(this.openHours, this.manualClose)[1],
  };
};

const Service = mongoose.model("Service", ServiceSchema);
export default Service;
