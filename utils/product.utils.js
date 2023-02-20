import moment from "moment-timezone";
export const filterByOpen = async (Product, condition, show_attrs) => {
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
  const open_products = await Product.find(open_condition, show_attrs).lean();
  for (const product of open_products) product.open_status = "open";

  const close_products = await Product.find(close_condition, show_attrs).lean();
  for (const product of close_products) product.open_status = "closed";

  const manuel_close_products = await Product.find(
    manuel_close_condition,
    show_attrs
  ).lean();
  for (const product of manuel_close_products)
    product.open_status = "temporary closed";

  const products = open_products.concat(close_products, manuel_close_products);

  for (const product of products) {
    if (product.images && product.images.length) {
      product.image = product.images[0];
      delete product.images;
    }
  }

  return products;
};
