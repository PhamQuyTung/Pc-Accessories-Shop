export function mergeSpecsFlat(categorySpecs = [], productSpecs = [], overrides = []) {
  const productMap = Object.fromEntries(
    productSpecs.map(s => [s.key, s.value])
  );

  const overrideMap = Object.fromEntries(
    overrides.map(s => [s.key, s.value])
  );

  return categorySpecs.map(spec => ({
    key: spec.key,
    label: spec.label,
    icon: spec.icon,
    value: overrideMap[spec.key] ?? productMap[spec.key] ?? '—',
  }));
}
