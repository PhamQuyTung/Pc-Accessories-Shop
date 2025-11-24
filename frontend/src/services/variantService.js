import axiosClient from '~/utils/axiosClient';

export const getVariantsByProduct = (productId) => {
    console.log('FE getVariantsByProduct → productId:', productId); // <-- LOG Ở ĐÂY
    return axiosClient.get(`/variants/${productId}`);
};

export const deleteVariant = (variantId) => {
    console.log('FE deleteVariant → variantId:', variantId); // <-- LOG Ở ĐÂY
    return axiosClient.delete(`/variants/${variantId}`);
};

export const updateVariant = (variantId, data) => {
    console.log('FE updateVariant → variantId:', variantId, 'data:', data); // LOG
    return axiosClient.put(`/variants/${variantId}`, data);
};

export const setDefaultVariant = (productId, variantId) => {
    return axiosClient.patch(`/variants/${productId}/${variantId}/default`);
};

// helper: get attribute by key (dùng endpoint bạn đã có ở CreateVariant)
export const getAttributeByKey = (key) => axiosClient.get(`/attributes/key/${key}`);

export const getAttributeTerms = (attributeId) => axiosClient.get(`/attribute-terms/by-attribute/${attributeId}`);
