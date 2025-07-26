import axiosClient from '~/utils/axiosClient';

export const getAddresses = () => axiosClient.get('/addresses');
export const createAddress = (data) => axiosClient.post('/addresses', data);
export const updateAddress = (id, data) => axiosClient.put(`/addresses/${id}`, data);
export const deleteAddress = (id) => axiosClient.delete(`/addresses/${id}`);
export const setDefaultAddress = (id) => axiosClient.patch(`/addresses/${id}/default`);
