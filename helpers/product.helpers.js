import moment from "moment-timezone";
import dotenv from "dotenv";
import {getTimeFromInt} from "../utils/time.utils.js";
import User from "../models/user.model.js";
import {getDistance} from "../utils/map.utils.js";

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

export const filterByOpen = async (product, condition, reqLat, reqLng) => {
  const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const now = moment().tz("Asia/Bangkok");
  const nowDay = days[now.isoWeekday() - 1];
  const nowTime = now.hours() * 60 + now.minutes();

  const openCondition = {
    $and: [
      condition,
      {
        $and: [
          {
            openHours: {
              $elemMatch: {
                day: nowDay,
                periods: {
                  $elemMatch: {
                    openAt: {$lte: nowTime},
                    closeAt: {$gte: nowTime},
                  },
                },
              },
            },
          },
          {manualClose: false},
        ],
      },
    ],
  };
  const manualcloseCondition = {
    $and: [condition, {manualClose: true}],
  };
  const closeCondition = {
    $and: [
      condition,
      {
        $and: [
          {
            openHours: {
              $not: {
                $elemMatch: {
                  day: nowDay,
                  periods: {
                    $elemMatch: {
                      openAt: {$lte: nowTime},
                      closeAt: {$gte: nowTime},
                    },
                  },
                },
              },
            },
          },
          {manualClose: false},
        ],
      },
    ],
  };

  let openProducts = await product.find(openCondition);
  openProducts = await Promise.all(openProducts.map((e) => e.toProductJSON()));
  for (const product of openProducts) product.openStatus = "Open";

  let closeProducts = await product.find(closeCondition);
  closeProducts = await Promise.all(
    closeProducts.map((e) => e.toProductJSON())
  );
  for (const product of closeProducts) product.openStatus = "Closed";

  let manualCloseProducts = await product.find(manualcloseCondition);
  manualCloseProducts = await Promise.all(
    manualCloseProducts.map((e) => e.toProductJSON())
  );
  for (const product of manualCloseProducts)
    product.openStatus = "Temporary Closed";

  const products = openProducts.concat(closeProducts, manualCloseProducts);

  for (const product of products) {
    if (reqLat && reqLng) {
      product.distance = getDistance(
        product.location.coordinates[1],
        product.location.coordinates[0],
        reqLat,
        reqLng
      );
    }
    // delete product.location;
  }

  return products;
};

export const makeCondition = (
  reqName,
  reqPetTags,
  reqServiceTags,
  condition = {}
) => {
  let nameCondition = {};

  if (reqName) {
    let x = reqName.split(/\b\s+/);
    const regex = x.map(function (e) {
      return new RegExp(e, "i");
    });
    nameCondition.$or = [
      {name: {$regex: reqName, $options: "i"}},
      {description: {$regex: reqName, $options: "i"}},
      {petTags: {$in: regex}},
      {serviceTags: {$in: regex}},
    ];
  }
  let tagsCondition = {};
  let petTagsCondition = {};
  let serviceTagsCondition = {};
  if (reqPetTags) {
    const encodedPetTags = reqPetTags;
    const petTags = JSON.parse(decodeURIComponent(encodedPetTags));
    if (petTags.length) {
      petTagsCondition.petTags = {
        $all: petTags,
      };
    }
  }
  if (reqServiceTags) {
    const encodedServiceTags = reqServiceTags;
    const serviceTags = JSON.parse(decodeURIComponent(encodedServiceTags));
    if (serviceTags.length) {
      tagsCondition.serviceTags = {
        $all: serviceTags,
      };
    }
  }
  tagsCondition.$and = [serviceTagsCondition, petTagsCondition];
  condition.$and = [nameCondition, tagsCondition];
  return condition;
};

export const sortProducts = (products, reqSort) => {
  let productsCopy = [...products];
  if (reqSort == "closest_location") {
    productsCopy.sort((a, b) => (a.distance < b.distance ? -1 : 1));
  } else if (reqSort == "lowest_rating") {
    productsCopy.sort((a, b) => (a.rating < b.rating ? -1 : 1));
  } else if (reqSort == "highest_rating") {
    productsCopy.sort((a, b) => (a.rating > b.rating ? -1 : 1));
  } else if (reqSort == "highest_reviews") {
    productsCopy.sort((a, b) => (a.reviewCounts > b.reviewCounts ? -1 : 1));
  } else if (reqSort == "newest") {
    productsCopy.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
  }
  return productsCopy;
};

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
          return ["Closed", `Today at ${getTimeFromInt(period.openAt)}`];
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

export const setFavorited = async (user_id, products) => {
  if (user_id) {
    let saveForLater = [];
    try {
      const user = await User.findOne({_id: user_id}, {saveForLater: 1});
      saveForLater = user.saveForLater;

      for (let product of products) {
        if (saveForLater.includes(product.id)) {
          product.isSaved = true;
        }
      }
    } catch (err) {
      console.error(err);
    }
  }
  return products;
};
