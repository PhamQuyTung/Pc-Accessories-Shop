// src/utils/getCardSpecs.js
export function getCardSpecs(specs, max = 6) {
  if (!Array.isArray(specs)) return [];

  // ưu tiên spec được tick showOnCard
  const primary = specs
    .flatMap((group) =>
      Array.isArray(group.fields)
        ? group.fields.filter((f) => f.showOnCard).map((f) => f.value)
        : []
    )
    .filter(Boolean);

  if (primary.length > 0) {
    return primary.slice(0, max);
  }

  // fallback: lấy spec đầu tiên nếu chưa tick gì
  return specs
    .flatMap((group) =>
      Array.isArray(group.fields) ? group.fields.map((f) => f.value) : []
    )
    .filter(Boolean)
    .slice(0, Math.min(2, max));
}
