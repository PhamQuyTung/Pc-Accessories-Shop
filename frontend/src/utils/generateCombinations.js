// utils/generateCombinations.js
export function generateCombinations(termsByAttribute) {
    if (!termsByAttribute.length) return [];

    return termsByAttribute.reduce(
        (acc, attr) => {
            const result = [];
            acc.forEach((comb) => {
                attr.terms.forEach((term) => {
                    result.push({
                        ...comb,
                        [attr._id]: term,
                    });
                });
            });
            return result;
        },
        [{}],
    );
}
