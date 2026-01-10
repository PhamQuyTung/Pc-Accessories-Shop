// src/utils/getCardSpecs.js
export function getCardSpecs(specs, max = 6) {
    if (!Array.isArray(specs)) return [];

    return specs
        .flatMap((group) =>
            Array.isArray(group.fields)
                ? group.fields
                      .filter((f) => f.showOnCard === true) // 🔥 CHỈ true
                      .map((f) => f.value)
                : [],
        )
        .filter(Boolean)
        .slice(0, max);
}
