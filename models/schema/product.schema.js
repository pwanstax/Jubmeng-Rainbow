const Product = {
  owner: {
    type: String,
    lowercase: true,
    required: [true, "can't be blank"],
    match: [/^[a-zA-Z0-9]+$/, "is invalid"],
    index: true,
  },
  license_id: {
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
  social_networks: {
    line_id: String,
    facebook: String,
    instagram: String,
    twitter: String,
  },
  status: {
    type: String,
    required: [true, "can't be blank"],
    enum: ["Pending", "Verified", "Unavailable", "Available"],
  },
  description: String,
  province: {
    type: String,
    required: [true, "can't be blank"],
  },
  location_description: {
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
  tags: {
    type: [String], //[long,lat]
    required: [true, "can't be blank"],
  },
  images: {
    type: [String],
    validate: (v) => Array.isArray(v) && v.length > 0,
  },
};

export default Product;
