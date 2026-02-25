// helpers/promotionPipeline.js

const promotionLookupPipeline = () => [
  {
    $lookup: {
      from: "promotions",
      let: { productId: "$_id", now: "$$NOW" },
      pipeline: [
        {
          $match: {
            deleted: { $ne: true },
          },
        },
        {
          $match: {
            $expr: {
              $and: [
                { $lte: ["$once.startAt", "$$now"] },
                { $gte: ["$once.endAt", "$$now"] },
              ],
            },
          },
        },
        {
          $match: {
            $expr: {
              $in: [
                "$$productId",
                {
                  $map: {
                    input: "$assignedProducts",
                    as: "ap",
                    in: "$$ap.product",
                  },
                },
              ],
            },
          },
        },
        {
          $project: {
            name: 1,
            slug: 1,
            promotionCardImg: 1,
            percent: 1,
            headerBgColor: 1,
            headerTextColor: 1,
          },
        },
        { $limit: 1 },
      ],
      as: "promotionInfo",
    },
  },
  {
    $addFields: {
      promotionInfo: {
        $ifNull: [{ $arrayElemAt: ["$promotionInfo", 0] }, null],
      },
    },
  },
];

module.exports = {
  promotionLookupPipeline,
};
