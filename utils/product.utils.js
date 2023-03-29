import moment from "moment-timezone";
import dotenv from "dotenv";

export const filterByOpen = async (Product, condition, reqLat, reqLng) => {
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
  let openProducts = await Product.find(openCondition);
  openProducts = openProducts.map((e) => e.toProductJSON());
  for (const product of openProducts) product.openStatus = "Open";

  let closeProducts = await Product.find(closeCondition);
  closeProducts = closeProducts.map((e) => e.toProductJSON());
  for (const product of closeProducts) product.openStatus = "Closed";

  let manualCloseProducts = await Product.find(manualcloseCondition);
  manualCloseProducts = manualCloseProducts.map((e) => e.toProductJSON());
  for (const product of manualCloseProducts)
    product.openStatus = "Temporary Closed";

  const products = openProducts.concat(closeProducts, manualCloseProducts);

  for (const product of products) {
    // if (product.images && product.images.length) {
    //   product.image = product.images[0];
    //   delete product.images;
    // }
    if (reqLat && reqLng) {
      product.distance = distance(
        product.location.coordinates[1],
        product.location.coordinates[0],
        reqLat,
        reqLng
      );
    }
    delete product.location;
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
  if (reqSort == "closest_location") {
    products.sort((a, b) => (a.distance < b.distance ? -1 : 1));
  } else if (reqSort == "lowest_rating") {
    products.sort((a, b) => (a.rating < b.rating ? -1 : 1));
  } else if (reqSort == "highest_rating") {
    products.sort((a, b) => (a.rating > b.rating ? -1 : 1));
  } else if (reqSort == "highest_reviews") {
    products.sort((a, b) => (a.reviewCounts > b.reviewCounts ? -1 : 1));
  }
  return products;
};

const distance = (lat1, lon1, lat2, lon2) => {
  if (lat1 == lat2 && lon1 == lon2) {
    return 0;
  } else {
    var radlat1 = (Math.PI * lat1) / 180;
    var radlat2 = (Math.PI * lat2) / 180;
    var theta = lon1 - lon2;
    var radtheta = (Math.PI * theta) / 180;
    var dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;

    dist = dist * 1.609344;
    //if (unit=="N") { dist = dist * 0.8684 }
    return dist;
  }
};
