import moment from "moment-timezone";
export const petTags = [
  "Cat",
  "Dog",
  "Bird",
  "Lion",
  "Rabbit",
  "Fish",
  "Hamster",
  "Turtle",
  "Horse",
  "Chicken",
  "Guinea pig",
];
export const serviceTags = {
  clinic: [
    "Veterinary",
    "Outpatient Service",
    "Vaccination",
    "Spay and Neuter",
    "Dental Care",
    "Health Examination",
    "Microchipping",
    "Surgery",
    "Mass Removal",
    "Physiotherapy",
    "Online Veterinary",
    "Housecall Vet",
    "Cat-friendly Clinic",
    "Chinese Medicine",
    "Acupuncture",
  ],
  service: [
    "Pet Massage",
    "Animal Communication Service",
    "Pet Swimming",
    "Hydrotherapy",
    "Day Care",
    "Dog Walking",
    "Pet Sitting At Home",
    "Pet Boarding",
    "Pet Transportation",
    "Pet Hospice",
    "Grooming Shop",
    "Spa",
  ],
  petfriendly: [
    "Restaurant",
    "Pet Garden",
    "Inclusive Parks for Pets",
    "Shopping Mall",
    "Walking Trail & Hiking",
    "Swimming Pool",
    "Camp Site",
    "Cultural & Heritage",
    "Event Space",
    "Photo Studio",
    "Wedding Venue",
    "Hotel",
    "Beach",
    "Water Activities",
  ],
};
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
const getTimeFromInt = (int) => {
  return (
    ("0" + Math.floor(int / 60)).slice(-2) + ":" + ("0" + (int % 60)).slice(-2)
  );
};
export const checkOpenOrClose = (openHours, manualClose) => {
  const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const mapDays = new Map([
    ["mon", "Monday"],
    ["tue", "Tuesday"],
    ["wed", "Wednesday"],
    ["thu", "Thursday"],
    ["fri", "Friday"],
    ["sat", "Saturday"],
    ["sun", "Sunday"],
  ]);
  const now = moment().tz("Asia/Bangkok");
  const nowDay = days[now.isoWeekday() - 1];
  const nowTime = now.hours() * 60 + now.minutes();
  if (manualClose) return ["Temporary Closed", ""];
  let firstOpen = "";
  let openAgain = "";
  let passNowDay = false;
  for (const e of openHours) {
    if (!firstOpen) {
      firstOpen = `${mapDays.get(e.day)} at ${getTimeFromInt(
        e.periods[0].openAt
      )}`;
    }
    if (e.day != nowDay && !passNowDay) {
      continue;
    } else if (e.day == nowDay) {
      passNowDay = true;
      for (const period of e.periods) {
        if (period.openAt <= nowTime && period.closeAt >= nowTime) {
          return ["Open", getTimeFromInt(period.closeAt)];
        } else if (period.openAt > nowTime) {
          return [
            "Closed",
            `${mapDays.get(e.day)} at ${getTimeFromInt(period.openAt)}`,
          ];
        }
      }
    } else if (passNowDay) {
      openAgain = `${mapDays.get(e.day)} at ${getTimeFromInt(
        e.periods[0].openAt
      )}`;
    }
  }
  if (!openAgain) {
    return ["Closed", firstOpen];
  }
  return ["Closed", openAgain];
};
