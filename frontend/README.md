# 📦 FRONTEND - Cấu trúc thư mục ReactJS

## 📁 public/
Chứa các file tĩnh như favicon, index.html. Không chứa logic JavaScript.

## 📁 src/
Thư mục chính chứa toàn bộ mã nguồn dự án.

### ├── assets/
Lưu trữ hình ảnh, icon, font, hoặc các tài nguyên tĩnh khác.

### ├── components/
Chứa các component tái sử dụng như Button, Modal, Navbar, Input, v.v.

### ├── config/
Lưu các file cấu hình: API base URL, biến môi trường, cấu hình hệ thống.

### ├── context/
Chứa các React Context dùng cho state toàn cục (user, theme, giỏ hàng,...).

### ├── data/
Dữ liệu mẫu (mock data), file JSON hoặc dữ liệu tĩnh để test.

### ├── layout/
Các layout chính như LayoutUser, LayoutAdmin,... (gồm header/footer/sidebar dùng chung).

### ├── libs/
Thư viện cấu hình (custom axios instance, jwt decode, middleware frontend,...).

### ├── pages/
Chứa các trang chính như Home, Login, Register, Product, Cart,...

### ├── routes/
Khai báo và xử lý các tuyến đường (route) của app.

### ├── styles/
Chứa CSS/SCSS toàn cục hoặc style module riêng cho component.

### ├── utils/
Các hàm tiện ích dùng chung (validateEmail, formatDate, debounce,...).

---

## 📄 App.jsx
File gốc của ứng dụng. Thường dùng để bọc context, định tuyến, và render layout chính.

## 📄 index.js
Điểm khởi tạo ứng dụng React. Render App vào DOM thông qua ReactDOM.

## 📄 package.json
Khai báo các dependencies, script khởi động, và cấu hình dự án React.

---

✅ Cấu trúc trên giúp tách biệt chức năng rõ ràng, dễ mở rộng và bảo trì dự án React.