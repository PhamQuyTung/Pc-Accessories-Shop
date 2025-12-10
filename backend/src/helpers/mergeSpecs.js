function mergeSpecs(product, variant) {
  // Clone specs từ product
  const finalSpecs = { ...(product.specs || {}) };

  // Nếu biến thể có override thì ghi đè
  if (variant?.specOverrides) {
    for (const [key, value] of variant.specOverrides.entries()) {
      finalSpecs[key] = value;
    }

    // for (const key in variant.specOverrides) {
    //   finalSpecs[key] = variant.specOverrides[key];
    // }
  }

  return finalSpecs;
}

module.exports = { mergeSpecs };
