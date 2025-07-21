// backend/src/app/middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const Account = require("../models/account");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Không có token xác thực" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🧪 decoded token:", decoded); // 👈 Thêm dòng này để xem key là `id` hay `userId`

    const user = await Account.findById(decoded.id).select("-password");
    console.log("✅ user tìm thấy:", user);

    if (!user)
      return res.status(401).json({ message: "Người dùng không tồn tại" });

    req.userId = user._id;
    console.log("🚀 Gán req.userId thành công:", req.userId);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
};

module.exports = authMiddleware;
