function mergeSpecs(product, variant) {
  const finalSpecs = Array.isArray(product.specs)
    ? JSON.parse(JSON.stringify(product.specs))
    : [];

  // ✅ normalize fields
  finalSpecs.forEach(g => {
    if (!Array.isArray(g.fields)) {
      g.fields = [];
    }
  });

  if (!variant?.specOverrides || typeof variant.specOverrides !== "object") {
    return finalSpecs;
  }

  for (const [groupName, fields] of Object.entries(variant.specOverrides)) {
    const group = finalSpecs.find(g => g.group === groupName);

    if (group) {
      if (!Array.isArray(group.fields)) {
        group.fields = [];
      }

      for (const [label, newValue] of Object.entries(fields)) {
        const field = group.fields.find(f => f.label === label);
        if (field) {
          field.value = newValue;
        } else {
          group.fields.push({ label, value: newValue });
        }
      }
    } else {
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
