import moment from "moment-timezone";

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
  open_hours: {
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
              open_at: {
                type: Number,
                min: 0,
                max: 1440,
                required: [true, "can't be blank"],
              },
              close_at: {
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
  manual_close: {
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
  review_counts: {
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

export const formatOpenHours = (open_hours) => {
  let formatOpenHours = [];
  for (const e of open_hours) {
    let periods = [];
    for (const period of e.periods) {
      periods.push({
        open_at:
          ("0" + Math.floor(period.open_at / 60)).slice(-2) +
          ":" +
          ("0" + (period.open_at % 60)).slice(-2),
        close_at:
          ("0" + Math.floor(period.close_at / 60)).slice(-2) +
          ":" +
          ("0" + (period.close_at % 60)).slice(-2),
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
};

export const checkOpenOrClose = (open_hours, manual_close) => {
  const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const now = moment().tz("Asia/Bangkok");
  const now_day = days[now.isoWeekday() - 1];
  const now_time = now.hours() * 60 + now.minutes();
  if (manual_close) return "temporary closed";
  for (const e of open_hours) {
    if (e.day != now_day) continue;
    for (const period of e.periods) {
      if (period.open_at <= now_time && period.close_at >= now_time) {
        return "open";
      }
    }
  }
  return "closed";
};
