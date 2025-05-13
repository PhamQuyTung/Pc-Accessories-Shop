const moment = require('moment');

module.exports = {
    formatDate: (date) => {
        return moment(date).format('DD/MM/YYYY - HH:mm:ss');
    },

    inc: function (value) {
        return parseInt(value) + 1;
    },

    dec: function (value) {
        return parseInt(value) - 1;
    },

    gt: function (a, b) {
        return a > b;
    },

    lt: function (a, b) {
        return a < b;
    },

    ifEquals: function (a, b, options) {
        return a === b ? options.fn(this) : options.inverse(this);
    },

    range: function (from, to) {
        let arr = [];
        for (let i = from; i <= to; i++) {
            arr.push(i);
        }
        return arr;
    },

    indexPagination: function (index, currentPage, limit) {
        return (currentPage - 1) * limit + index + 1;
    },

    add: (a, b) => a + b,
    subtract: (a, b) => a - b,
};
