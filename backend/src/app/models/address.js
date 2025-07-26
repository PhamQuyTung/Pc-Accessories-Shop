// models/address.js
const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
    },

    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: "Email không hợp lệ",
      },
    },

    phone: { type: String, required: true, trim: true },

    city: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    ward: { type: String, required: true, trim: true },
    detail: { type: String, required: true, trim: true },

    postalCode: { type: String, trim: true },

    type: {
      type: String,
      enum: ["home", "company", "other"],
      default: "home",
    },

    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/** ------- Normalize helpers ------- */
function normalizeDoc(doc) {
  if (!doc) return;
  if (typeof doc.firstName === "string") doc.firstName = doc.firstName.trim();
  if (typeof doc.lastName === "string") doc.lastName = doc.lastName.trim();
  if (typeof doc.email === "string") doc.email = doc.email.trim().toLowerCase();
  if (typeof doc.phone === "string") doc.phone = doc.phone.trim();
  if (typeof doc.city === "string") doc.city = doc.city.trim();
  if (typeof doc.district === "string") doc.district = doc.district.trim();
  if (typeof doc.ward === "string") doc.ward = doc.ward.trim();
  if (typeof doc.detail === "string") doc.detail = doc.detail.trim();
  if (typeof doc.postalCode === "string")
    doc.postalCode = doc.postalCode.trim();

  if (!["home", "company", "other"].includes(doc.type)) {
    doc.type = "home";
  }
}

addressSchema.pre("save", function (next) {
  normalizeDoc(this);
  next();
});

// findOneAndUpdate bypasses save() -> normalize manually
addressSchema.pre(["findOneAndUpdate", "updateOne"], function (next) {
  const update = this.getUpdate();
  if (!update) return next();

  if (update.$set) {
    normalizeDoc(update.$set);
  } else {
    normalizeDoc(update);
  }

  next();
});

module.exports = mongoose.model("Address", addressSchema);
