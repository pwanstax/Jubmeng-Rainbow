import moment from "moment-timezone";
import dotenv from "dotenv";

export const filterByOpen = async (Product, condition, req_lat, req_lng) => {
  const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const now = moment().tz("Asia/Bangkok");
  const now_day = days[now.isoWeekday() - 1];
  const now_time = now.hours() * 60 + now.minutes();
  const open_condition = {
    $and: [
      condition,
      {
        $and: [
          {
            open_hours: {
              $elemMatch: {
                day: now_day,
                periods: {
                  $elemMatch: {
                    open_at: {$lte: now_time},
                    close_at: {$gte: now_time},
                  },
                },
              },
            },
          },
          {manual_close: false},
        ],
      },
    ],
  };

  const manuel_close_condition = {
    $and: [condition, {manual_close: true}],
  };

  const close_condition = {
    $and: [
      condition,
      {
        $and: [
          {
            open_hours: {
              $not: {
                $elemMatch: {
                  day: now_day,
                  periods: {
                    $elemMatch: {
                      open_at: {$lte: now_time},
                      close_at: {$gte: now_time},
                    },
                  },
                },
              },
            },
          },
          {manual_close: false},
        ],
      },
    ],
  };
  let open_products = await Product.find(open_condition);
  open_products = open_products.map((e) => e.toProductJSON());
  for (const product of open_products) product.open_status = "open";

  let close_products = await Product.find(close_condition);
  close_products = close_products.map((e) => e.toProductJSON());
  for (const product of close_products) product.open_status = "closed";

  let manuel_close_products = await Product.find(manuel_close_condition);
  manuel_close_products = manuel_close_products.map((e) => e.toProductJSON());
  for (const product of manuel_close_products)
    product.open_status = "temporary closed";

  const products = open_products.concat(close_products, manuel_close_products);

  for (const product of products) {
    // if (product.images && product.images.length) {
    //   product.image = product.images[0];
    //   delete product.images;
    // }
    if (req_lat && req_lng) {
      product.distance = distance(
        product.location.coordinates[1],
        product.location.coordinates[0],
        req_lat,
        req_lng
      );
    }
    delete product.location;
  }
  return products;
};

export const makeCondition = (req_name, req_petTags, req_serviceTags) => {
  let condition = {};
  let name_condition = {};
  if (req_name) {
    name_condition.$or = [
      {name: {$regex: req_name, $options: "i"}},
      {description: {$regex: req_name, $options: "i"}},
    ];
  }
  let tags_condition = {};
  let petTags_condition = {};
  let serviceTags_condition = {};
  if (req_petTags) {
    const encoded_petTags = req_petTags;
    const petTags = JSON.parse(decodeURIComponent(encoded_petTags));
    if (petTags.length) {
      petTags_condition.petTags = {
        $all: petTags,
      };
    }
  }
  if (req_serviceTags) {
    const encoded_serviceTags = req_serviceTags;
    const serviceTags = JSON.parse(decodeURIComponent(encoded_serviceTags));
    if (serviceTags.length) {
      tags_condition.serviceTags = {
        $all: serviceTags,
      };
    }
  }
  tags_condition.$and = [serviceTags_condition, petTags_condition];
  condition.$and = [name_condition, tags_condition];
  return condition;
};

export const sortProducts = (products, req_sort) => {
  if (req_sort == "distance") {
    products.sort((a, b) => (a.distance < b.distance ? -1 : 1));
  } else if (req_sort == "ascending rating") {
    products.sort((a, b) => (a.rating < b.rating ? -1 : 1));
  } else if (req_sort == "descending rating") {
    products.sort((a, b) => (a.rating > b.rating ? -1 : 1));
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
