import axiosClient from "~/utils/axiosClient";

export const getVariantsByProduct = (productId) =>
  axiosClient.get(`/variants/${productId}`);

export const deleteVariant = (variantId) =>
  axiosClient.delete(`/variants/${variantId}`);
