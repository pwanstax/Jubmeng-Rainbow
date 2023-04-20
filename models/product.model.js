import mongoose from "mongoose";
import dotenv from "dotenv";
import {getImageUrl} from "../utils/gcs.utils.js";
import {isValidImageUrl} from "../utils/regx.utils.js";
import {
  formatOpenHours,
  checkOpenOrClose,
  mapServiceTagIcon,
} from "../helpers/product.helpers.js";
dotenv.config({path: ".env"});

const ProductSchema = new mongoose.Schema(
  {
    owner: {
      type: String,
      lowercase: true,
      required: [true, "can't be blank"],
      match: [/^[a-zA-Z0-9]+$/, "is invalid"],
      index: true,
    },
    licenseID: {
      type: String,
      required: [true, "can't be blank"],
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "can't be blank"],
    },
    phones: {
      type: [String],
    },
    socialNetworks: {
      lineID: String,
      facebook: String,
      instagram: String,
      twitter: String,
    },
    status: {
      type: String,
      required: [true, "can't be blank"],
      enum: ["Pending", "Verified", "Unavailable", "Available"],
      default: "Pending",
    },
    description: String,
    province: {
      type: String,
      required: [true, "can't be blank"],
    },
    amphure: {
      type: String,
      required: [true, "can't be blank"],
    },
    tambon: {
      type: String,
      required: [true, "can't be blank"],
    },
    locationDescription: {
      type: String,
      required: [true, "can't be blank"],
    },
    location: {
      //GeoJSON

      type: {
        type: String,
        enum: ["Point"],
        required: [true, "can't be blank"],
      },
      coordinates: {
        type: [Number], //[long,lat]
        required: [true, "can't be blank"],
      },
      //required: [true, "can't be blank"],
    },
    petTags: {
      type: [String], //[long,lat]
      required: [true, "can't be blank"],
    },
    serviceTags: {
      type: [String], //[long,lat]
      required: [true, "can't be blank"],
    },
    images: {
      type: [String],
      validate: (v) => Array.isArray(v) && v.length > 0,
    },
    openHours: {
      type: [
        {
          day: {
            type: String,
            required: [true, "can't be blank"],
            enum: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
          },
          periods: {
            type: [
              {
                openAt: {
                  type: Number,
                  min: 0,
                  max: 1440,
                  required: [true, "can't be blank"],
                },
                closeAt: {
                  type: Number,
                  min: 0,
                  max: 1440,
                  required: [true, "can't be blank"],
                },
              },
            ],
            validate: (v) => Array.isArray(v) && v.length > 0,
          },
        },
      ],
      validate: (v) => Array.isArray(v) && v.length > 0,
    },
    manualClose: {
      type: Boolean,
      required: [true, "can't be blank"],
      default: false,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      required: [true, "can't be blank"],
      default: 5,
    },
    reviewCounts: {
      type: Number,
      min: 0,
      required: [true, "can't be blank"],
      default: 0,
    },
    prices: {
      type: [
        {
          service: {
            type: String,
            required: [true, "can't be blank"],
          },
          price: {
            type: Number,
            required: [true, "can't be blank"],
          },
        },
      ],
    },
    placeType: {
      type: String,
    },
  },
  {timestamps: true}
);

ProductSchema.methods.confirmProductInfo = function () {
  return {
    product: {
      owner: this.owner,
      name: this.name,
      status: this.status,
      province: this.province,
      openHours: formatOpenHours(this.openHours),
    },
  };
};

ProductSchema.methods.toProductJSON = async function () {
  let imageUrl = this.images[0];
  if (!isValidImageUrl(imageUrl)) {
    imageUrl = await getImageUrl(
      process.env.GCS_MERCHANT_IMAGES_BUCKET,
      null,
      imageUrl
    );
  }
  return {
    id: this._id,
    owner: this.owner,
    name: this.name,
    province: this.province,
    amphure: this.amphure,
    tambon: this.tambon,
    status: this.status,
    image: imageUrl,
    locationDescription: this.locationDescription,
    location: this.location,
    tags: mapServiceTagIcon(this.serviceTags),
    rating: this.rating,
    reviewCounts: this.reviewCounts,
    description: this.description || "",
    openHours: formatOpenHours(this.openHours),
    placeType: this.placeType || "",
    openStatusTimeDetail: checkOpenOrClose(this.openHours, this.manualClose)[1],
    createdAt: this.createdAt,
  };
};

ProductSchema.methods.toProductDetailJSON = async function () {
  let imageUrls = [];
  for (const image of this.images) {
    if (!isValidImageUrl(image)) {
      let imageUrl = await getImageUrl(
        process.env.GCS_MERCHANT_IMAGES_BUCKET,
        null,
        image
      );
      imageUrls.push(imageUrl);
    } else {
      imageUrls.push(image);
    }
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
    placeType: this.placeType || "",
    openStatus: checkOpenOrClose(this.openHours, this.manualClose)[0],
    openStatusTimeDetail: checkOpenOrClose(this.openHours, this.manualClose)[1],
  };
};

ProductSchema.methods.setLocation = function (latitude, longitude) {
  this.location = {
    type: "Point",
    coordinates: [longitude, latitude],
  };
};

ProductSchema.methods.setOpenHours = function (openHours) {
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

const Product = mongoose.model("Product", ProductSchema);
export default Product;
