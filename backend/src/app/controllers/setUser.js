module.exports = function (req, res, next) {
    res.locals.user = req.user; // Gắn req.user vào res.locals
    next();
};