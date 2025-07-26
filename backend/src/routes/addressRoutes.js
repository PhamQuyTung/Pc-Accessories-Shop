// routes/addressRoutes.js
const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const auth = require("../app/middlewares/authMiddleware");
const validate = require("../app/middlewares/validateMiddleware");
const addressController = require("../app/controllers/addressController");

const normalizeVNPhone = (raw = "") => {
  const v = String(raw).trim().replace(/\s+/g, "");
  // +84xxxxxxxxx  -> 0xxxxxxxxx
  if (/^\+?84/.test(v)) {
    return "0" + v.replace(/^\+?84/, "");
  }
  return v;
};

const isValidVNPhone = (v) => /^0\d{9}$/.test(v); // 10 số, bắt đầu bằng 0

const createUpdateValidators = [
  body("firstName").trim().notEmpty().withMessage("firstName là bắt buộc"),
  body("lastName").trim().notEmpty().withMessage("lastName là bắt buộc"),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("phone là bắt buộc")
    .customSanitizer(normalizeVNPhone)
    .custom((v) => isValidVNPhone(v))
    .withMessage(
      "Số điện thoại không hợp lệ (phải có 10 số, bắt đầu bằng 0 hoặc +84...)"
    ),

  body("email").optional().trim().isEmail().withMessage("Email không hợp lệ"),

  body("city").trim().notEmpty().withMessage("city là bắt buộc"),
  body("district").trim().notEmpty().withMessage("district là bắt buộc"),
  body("ward").trim().notEmpty().withMessage("ward là bắt buộc"),
  body("detail").trim().notEmpty().withMessage("detail là bắt buộc"),
  body("type")
    .optional()
    .isIn(["home", "company", "other"])
    .withMessage("type không hợp lệ"),
];

router.get("/", auth, addressController.getAddresses);
router.post(
  "/",
  auth,
  createUpdateValidators,
  validate,
  addressController.createAddress
);
router.put(
  "/:id",
  auth,
  createUpdateValidators,
  validate,
  addressController.updateAddress
);
router.delete("/:id", auth, addressController.deleteAddress);
router.patch(
  "/:id/default",
  auth,
  body("isDefault").optional().isBoolean().withMessage("isDefault phải là boolean"),
  validate,
  addressController.setDefault
);

module.exports = router;
