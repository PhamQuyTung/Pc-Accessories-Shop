# 📁 Cấu trúc thư mục Backend - PC Accessories Project

✍️ Dưới đây là mô tả chi tiết cấu trúc thư mục trong thư mục `backend/src` của dự án:

backend/
└── src/
    ├── app/
    │ ├── controllers/ # Chứa các file controller, xử lý logic từ request
    │ ├── middlewares/ # Chứa các middleware dùng chung (auth, error handler...)
    │ └── models/ # Định nghĩa schema cho MongoDB bằng Mongoose
    │
    ├── config/ # Cấu hình hệ thống (kết nối DB, biến môi trường...)
    │ └── db.js # Kết nối MongoDB
    │
    ├── public/ # Tài nguyên tĩnh (hình ảnh, CSS)
    │ ├── css/
    │ └── img/
    │
    ├── resources/
    │ └── scss/ # Các file SCSS (nếu cần dùng frontend template)
    │ └── views/ # Giao diện view nếu dùng template engine như EJS
    │
    ├── routes/ # Các route chính (định tuyến HTTP)
    │
    └── utils/ # Các hàm tiện ích tái sử dụng
    │
    └── server.js/ # File chính để chạy server
    

### 🧩 Ý nghĩa các thành phần chính

- `controllers/`: Nơi xử lý logic chính (CRUD, xử lý dữ liệu, gọi model).
- `models/`: Xác định cấu trúc dữ liệu (schema) để làm việc với MongoDB.
- `middlewares/`: Các hàm xử lý trung gian như xác thực, kiểm tra token...
- `routes/`: Khai báo các endpoint RESTful, liên kết đến controller tương ứng.
- `config/db.js`: Cấu hình kết nối MongoDB thông qua `mongoose`.
- `public/`: Tài nguyên công khai phục vụ frontend như hình ảnh, file CSS.
- `views/`: Dùng nếu server render HTML bằng EJS, Handlebars, v.v.
- `utils/`: Các tiện ích như mã hóa, xử lý chuỗi, gửi mail...

