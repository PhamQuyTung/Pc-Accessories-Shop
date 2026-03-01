# Fix: Thêm sản phẩm vào giỏ hàng khi có quà tặng

## Vấn đề được giải quyết

### VD1: Error khi add lại sản phẩm có gift
- **Hiện tượng**: Khi thêm sản phẩm chính lần 2 (Laptop), hiện error "Sản phẩm này đã có trong giỏ hàng" nhưng sản phẩm vẫn được add
- **Nguyên nhân**: Auto-add gift query tìm `isGift: true` nhưng gift đang là normal item (`isGift: false`) → E11000 duplicate key error

### VD2: Gift không trở lại gift status
- **Hiện tượng**: Sau khi xóa product chính rồi add lại, gift (chuột) không được convert thành gift (giá vẫn 700k thay vì 0đ)
- **Nguyên nhân**: removeFromCart chỉ convert gift → normal thay vì xóa, nên khi auto-add gift không tìm thấy để convert

## Giải pháp

### Backend Changes

#### 1. cartController.js - addToCart
- ✅ Auto-add gift: Tìm item bất kể `isGift` value, rồi convert thành gift
- ✅ Không dùng `upsert: true`, mà dùng `findOne` + `create` riêng biệt
- ✅ Log chi tiết để debug

#### 2. cartController.js - removeFromCart
- ✅ Khi remove product chính (isGift: false): **XÓA** gift items (deleteMany) thay vì convert
- ✅ Sử dụng `isGift: true` filter để chỉ xóa gift items

#### 3. cartController.js - updateCartQuantity
- ✅ Khi update product chính quantity: Tự động update gift quantity theo ratio
- Ví dụ: Nếu product từ 1 → 2 (tăng 2x), gift quantity cũng tăng 2x

#### 4. cartController.js - getCart
- ✅ Clean up orphan gift items: Nếu gift item có `parentProductId: null`, xóa nó
- ✅ Tránh tình trạng gift items mồ côi

#### 5. cart.js - Model Index
- ✅ Cập nhật unique index từ `{ user_id, product_id, variation_id, parentProductId }` 
- ✅ Sang `{ user_id, product_id, variation_id, isGift }`
- ✅ Lý do: Avoid unique constraint conflict khi convert gift ↔ normal

### Frontend Changes

#### 1. useCart.js
- ✅ Ensure fetch cart ngay sau khi add (đã có)
- ✅ Proper error throw để component catch

#### 2. CartPage.js - removeFromCart
- ✅ Add error toast khi remove fail
- ✅ Cải thiện UX feedback

## Cách apply fix

### Step 1: Drop old MongoDB index
```bash
cd backend
node dropOldCartIndex.js
```
Lệnh này sẽ:
- Drop old index: `user_id_1_product_id_1_variation_id_1_parentProductId_1`
- Verify new index: `user_id_1_product_id_1_variation_id_1_isGift_1`

### Step 2: Restart backend
```bash
npm start
# hoặc nếu dùng nodemon
nodemon server.js
```
Mongoose sẽ tự create new index khi khởi động

### Step 3: Test flow

#### Test Case 1: Add → Remove → Add lại (VD1 fix)
1. Add Laptop gaming (có gift Chuột)
   - ✅ Laptop được add (quantity=1)
   - ✅ Chuột được add với `isGift: true, parentProductId: Laptop._id`
   
2. Kiểm tra giỏ hàng
   - ✅ Laptop giá 32.290.000đ
   - ✅ Chuột giá 0đ (vì isGift: true)
   
3. Xóa Laptop
   - ✅ Laptop bị xóa
   - ✅ Chuột cũng bị xóa (vì là gift của Laptop)
   - ✅ Không còn sản phẩm nào trong giỏ
   
4. Add Laptop lần 2
   - ✅ **Ko có error**, success toast "Đã thêm vào giỏ hàng"
   - ✅ Laptop được add lại
   - ✅ Chuột được add lại với `isGift: true, giá 0đ` (VD2 fix)

#### Test Case 2: Update quantity product chính
1. Add Laptop quantity=1 (auto add Chuột quantity=1)
2. Update Laptop quantity → 2
   - ✅ Laptop quantity = 2
   - ✅ Chuột quantity cũng = 2 (tự động update)

#### Test Case 3: Add sản phẩm khác không có gift
1. Add chuột khác không phải gift
2. Add Laptop có gift
   - ✅ Không bị conflic, cả 2 sản phẩm đều ở giỏ hàng

#### Test Case 4: Manually re-add gift after deletion
1. Start with Laptop + gift in cart
2. Remove the gift item only (Laptop stays)
   - ✅ Laptop remains in cart
   - ✅ Gift item is gone
3. Click "Add to cart" on the gift product page or add gift directly again
   - ✅ API detects Laptop already in cart and marks the item as a gift
   - ✅ Gift item gets created/converted with `isGift: true` and `parentProductId` set
   - ✅ On the frontend the price shows 0₫ (not 700.000₫)
   - ✅ A success toast appears instead of an error

## Files thay đổi

```
Backend:
- src/app/controllers/cartController.js (addToCart, removeFromCart, updateCartQuantity, getCart)
- src/app/models/cart.js (update unique index)
- dropOldCartIndex.js (migration script - mới tạo)

Frontend:
- src/pages/Product/ProductDetail/hooks/useCart.js (error handling)
- src/pages/CartPage/CartPage.js (error toast)
```

## Notes
- Nếu có issue với index, hãy chạy migration script trước khi restart backend
- Các gift items sẽ tự động xóa khi fetch cart nếu parent product không còn
- Log console backend sẽ show chi tiết khi add/remove/update gift items
