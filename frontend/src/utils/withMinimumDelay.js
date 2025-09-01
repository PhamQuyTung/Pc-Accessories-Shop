// utils/withMinimumDelay.js
export const withMinimumDelay = async (promise, delay = 400) => {
    const [res] = await Promise.all([promise, new Promise((resolve) => setTimeout(resolve, delay))]);
    return res;
};
