const Joi = require('joi');

const accountSchemaRegisterValid = Joi.object({
    name: Joi.string().min(3).message('Tên đăng nhập phải trên 3 ký tự').max(30).message('Tên đăng nhập không được quá 30 ký tự').required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).message('Mật khẩu phải trên 6 ký tự').max(30).message('Mật khẩu không được quá 30 ký tự').required(),
    role: Joi.string().valid('admin', 'user').default('user'),
})

module.exports = (account) => accountSchemaRegisterValid.validate(account);