import axiosClient from '~/utils/axiosClient';

export const updateProductAttributes = (productId, attributes) =>
    axiosClient.patch(`/products/${productId}/attributes`, { attributes });
