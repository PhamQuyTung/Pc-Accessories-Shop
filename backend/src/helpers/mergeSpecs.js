function mergeSpecs(product, variant) {
  // Clone specs từ product (product.specs của bạn là ARRAY chứ không phải OBJECT)
  const finalSpecs = Array.isArray(product.specs)
    ? JSON.parse(JSON.stringify(product.specs))
    : [];

  // Nếu không có overrides → trả lại nguyên bản
  if (!variant?.specOverrides || typeof variant.specOverrides !== "object") {
    return finalSpecs;
  }

  // Với mỗi override
  for (const [groupName, fields] of Object.entries(variant.specOverrides)) {
    // Tìm group trong product.specs
    const group = finalSpecs.find((g) => g.group === groupName);

    // Nếu group tồn tại
    if (group) {
      for (const [label, newValue] of Object.entries(fields)) {
        const field = group.fields.find((f) => f.label === label);
        if (field) {
          field.value = newValue; // ghi đè
        } else {
          // Nếu label chưa tồn tại → thêm mới
          group.fields.push({ label, value: newValue });
        }
      }
    } else {
      // Nếu group chưa tồn tại → thêm nhóm mới
      finalSpecs.push({
        group: groupName,
        fields: Object.entries(fields).map(([label, value]) => ({
          label,
          value,
        })),
      });
    }
  }

  return finalSpecs;
}

module.exports = { mergeSpecs };
