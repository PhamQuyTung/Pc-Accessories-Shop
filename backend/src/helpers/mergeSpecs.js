function mergeSpecs(product, variant, categorySpecs = []) {
  const productSpecsMap = new Map();
  const overrideMap =
    variant?.specOverrides instanceof Map
      ? Object.fromEntries(variant.specOverrides)
      : variant?.specOverrides || {};

  // Map product.specs → key:value
  if (Array.isArray(product.specs)) {
    for (const s of product.specs) {
      if (s?.key) {
        productSpecsMap.set(s.key, s.value ?? "");
      }
    }
  }

  // Build final specs theo category
  const finalSpecs = [];

  for (const catSpec of categorySpecs) {
    const key = catSpec.key;
    if (!key) continue;

    // respect showOnTable flag: we only include specs that are meant to be shown in tables
    if (catSpec.showOnTable === false) continue;

    const value = overrideMap[key] ?? productSpecsMap.get(key) ?? "";

    finalSpecs.push({
      key,
      label: catSpec.label,
      value,
      type: catSpec.type || "text",
      icon: catSpec.icon || "default",
      showOnCard: !!catSpec.showOnCard,
      showOnTable: !!catSpec.showOnTable,
    });
  }

  return finalSpecs;
}

module.exports = { mergeSpecs };
