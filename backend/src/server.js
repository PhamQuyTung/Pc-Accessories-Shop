const express = require("express");
const path = require("path");
const morgan = require("morgan");
const methodOverride = require("method-override");
const { engine } = require("express-handlebars");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Tạo thư mục lưu ảnh & serve static
const fs = require("fs");
const uploadDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 👇 NEW: import định tuyến chính
const route = require("./routes");

dotenv.config();

const app = express();

// Kết nối MongoDB
connectDB();

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
// Public folder uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("combined"));
app.use(cookieParser());

// View engine
app.engine("hbs", engine({ extname: ".hbs" }));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "resources", "views"));

require("./jobs/promotionEngine");

// ✅ Gọi file định tuyến
route(app); // ⬅️ THÊM DÒNG NÀY

// Server listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
