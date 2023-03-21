import moment from "moment-timezone";

const Product = {
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
  manualCose: {
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
};

export default Product;

export const formatOpenHours = (openHours) => {
  let formatOpenHours = [];
  for (const e of openHours) {
    let periods = [];
    for (const period of e.periods) {
      periods.push({
        openAt:
          ("0" + Math.floor(period.openAt / 60)).slice(-2) +
          ":" +
          ("0" + (period.openAt % 60)).slice(-2),
        closeAt:
          ("0" + Math.floor(period.closeAt / 60)).slice(-2) +
          ":" +
          ("0" + (period.closeAt % 60)).slice(-2),
      });
    }
    formatOpenHours.push({
      day: e.day,
      periods: periods,
    });
  }
  return formatOpenHours;
};

export const mapServiceTagIcon = (tags) => {
  let ret = [];
  for (const tag of tags) {
    ret.push({
      class: "fa-solid fa-syringe", //must change to be real icon
      name: tag,
    });
  }
  return ret;
};

export const checkOpenOrClose = (openHours, manualCose) => {
  const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const now = moment().tz("Asia/Bangkok");
  const nowDay = days[now.isoWeekday() - 1];
  const nowTime = now.hours() * 60 + now.minutes();
  if (manualCose) return ["Temporary Closed", ""];
  for (const e of openHours) {
    if (e.day != nowDay) continue;
    for (const period of e.periods) {
      if (period.openAt <= nowTime && period.closeAt >= nowTime) {
        return [
          "Open",
          ("0" + Math.floor(period.closeAt / 60)).slice(-2) +
            ":" +
            ("0" + (period.closeAt % 60)).slice(-2),
        ];
      }
    }
  }
  return ["Closed", ""];
};
