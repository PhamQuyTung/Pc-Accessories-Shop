// models/account.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const GENDERS = ["Nam", "Nữ", "Khác"];

const userSchema = new mongoose.Schema(
  {
    // nếu bạn vẫn muốn giữ "name" để không ảnh hưởng nơi khác
    name: { type: String, trim: true },

    firstName: { type: String, default: "", trim: true },
    lastName: { type: String, default: "", trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },

    phone: { type: String, default: "", trim: true },
    gender: { type: String, enum: GENDERS, default: "Nam" },
    dob: { type: Date, default: null },
    avatar: { type: String, default: "" },

    role: { type: String, enum: ["admin", "user"], default: "user" },

    recentlyViewed: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      const salt = await bcrypt.genSalt(saltRounds);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model("account", userSchema);
module.exports.GENDERS = GENDERS;
