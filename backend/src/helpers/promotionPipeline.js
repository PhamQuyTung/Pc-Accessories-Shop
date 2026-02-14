// helpers/promotionPipeline.js

const promotionLookupPipeline = () => [
  {
    $lookup: {
      from: "promotions",
      let: { productId: "$_id" },
      pipeline: [
        {
          $match: {
            currentlyActive: true,
            deleted: { $ne: true }, // nếu sau này bạn có soft delete promotion
          },
        },
        {
          $match: {
            $expr: {
              $in: ["$$productId", "$assignedProducts.product"],
            },
          },
        },
        {
          $project: {
            name: 1,
            slug: 1,
            promotionCardImg: 1,
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
