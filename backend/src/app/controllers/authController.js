const accountModel = require('../models/account');
const accountValid = require('../../validations/account');

module.exports = {
    login: async(req, res) => {
        // login
        
    },

    register: async(req, res) => {
        // register
        const body = req.body;
        const { error, value } = accountValid(body);
        if (error) {
            return res.status(400).json({
                statusCode: 400,
                message: error.message,
            });
        }

        // Lưu vào value
        const account = await accountModel.create(value);
        return res.status(201).json({account});
    },
}