export const formatCurrency = (number) => {
    if (!number && number !== 0) return '';
    return number.toLocaleString('vi-VN', {
        style: 'currency',
        currency: 'VND',
    });
};
