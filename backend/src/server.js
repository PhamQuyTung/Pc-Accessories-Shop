const express = require("express");
const path = require("path");
const morgan = require("morgan");
const methodOverride = require("method-override");
const { engine } = require("express-handlebars");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

const fs = require("fs");
const http = require("http"); // 👈 thêm
const { Server } = require("socket.io"); // 👈 thêm

// Tạo thư mục lưu ảnh & serve static
const uploadDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const route = require("./routes");
dotenv.config();

const app = express();
const server = http.createServer(app); // 👈 thay vì app.listen trực tiếp

// Khởi tạo socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Gắn io vào app.locals (hoặc export riêng ra module để controller dùng)
app.locals.io = io;

// Khi client kết nối
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("connect", () => console.log("✅ Connected to socket.io"));

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Kết nối MongoDB
connectDB();

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("combined"));
app.use(cookieParser());

// View engine
app.engine("hbs", engine({ extname: ".hbs" }));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "resources", "views"));

require("./jobs/promotionEngine");

// ✅ Gọi routes
route(app);

// Server listen
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  // 👈 dùng server.listen thay vì app.listen
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

// Export để controller có thể import io
module.exports = { app, server, io };
