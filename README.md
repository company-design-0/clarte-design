# Clarté Design

Landing page cho studio thiết kế web & app, dùng Vite, JavaScript và Three.js. Tiếng Việt mặc định; có chuyển sang tiếng Anh.

## Chạy local

Yêu cầu Node.js 20.19+ hoặc 22.12+ và npm.

Mở Terminal và chuyển vào thư mục dự án:

```sh
cd /Users/linhphan/Documents/Clarte-Design
npm install
npm run dev
```

`npm install` chỉ cần khi mới tải dự án hoặc khi dependency thay đổi.

Mở địa chỉ Vite in trong Terminal bằng Chrome, thường là `http://localhost:5173/`. Nếu cổng 5173 đang được dùng, Vite có thể chọn cổng khác; dùng đúng địa chỉ được in ra.

Giữ Terminal chạy trong lúc xem website. Nhấn **Control + C** để dừng server.

**Không nhấp đúp `index.html` trong Finder để mở bằng `file://`.** Dự án dùng JavaScript modules và import Three.js qua Vite; mở trực tiếp file sẽ gặp lỗi đường dẫn tài nguyên và chính sách CORS của trình duyệt. Hãy chạy qua localhost như trên, hoặc deploy bản build lên hosting.

## Build và preview

```sh
npm run build
npm run preview -- --port 4317 --strictPort
```

Deploy thư mục `dist/` lên static hosting. Không có backend hay cơ sở dữ liệu.

## Cấu hình trước khi xuất bản

Sửa `src/config.js`:

- `email`: địa chỉ nhận yêu cầu dự án.
- `phone`, `zalo`: số điện thoại và đường dẫn Zalo thật.
- `facebook`, `instagram`, `messenger`: URL đã xác minh; để trống nếu không có.
- `hours`, `area`: lịch làm việc và khu vực phục vụ thật cho cả VI/EN.

Các giá trị liên hệ mặc định để trống để không dẫn khách tới tài khoản hoặc hộp thư giả. Giờ làm việc hiện là lịch mẫu, cần xác nhận trước khi xuất bản.

Khi chưa có email, form tạo bản tóm tắt ngay trên thiết bị và cho sao chép. Không gửi hay lưu dữ liệu lên server. Khi đã cấu hình email, form mở ứng dụng email qua `mailto:`; khách vẫn cần tự bấm gửi trong ứng dụng email. Muốn nhận form trực tiếp cần tích hợp backend hoặc dịch vụ form riêng.

## Nội dung và hình ảnh

- `src/i18n.js`: toàn bộ nội dung VI/EN và danh sách lĩnh vực.
- `src/style.css`: màu, typography, spacing và responsive.
- `src/scene.js`: phong cảnh mặt trời và đồi phẳng, chuyển động nhẹ bằng Three.js trong mockup trình duyệt. Không có khối kính, quỹ đạo, bụi hoặc canvas phủ toàn trang.
- `token-design.jpeg`: hình tham chiếu do chủ dự án cung cấp. Màu/font được diễn giải từ hình, không phải bộ token gốc chính xác.
- Mockup Aura là minh hoạ nguyên tắc thiết kế, không phải tuyên bố về một khách hàng hay dự án đã thực hiện.

Font Cormorant Garamond và Be Vietnam Pro tải từ Google Fonts; luôn có font hệ thống dự phòng. Nếu cần chạy hoàn toàn offline, tự host các font được cấp phép tương ứng.

## Accessibility và chuyển động

Có menu bàn phím với Escape/focus trap, skip link, focus ring, nhãn form và trạng thái lỗi. Cảnh Three.js được lazy-load, giới hạn pixel ratio và ngừng render khi vùng phong cảnh ra khỏi màn hình hoặc tab bị ẩn. `prefers-reduced-motion` render cảnh tĩnh; nếu WebGL không khả dụng, nội dung và form vẫn hoạt động.

## Kiểm tra

```sh
npm test
npm run build
```

Kết quả kiểm thử trình duyệt và ảnh kiểm tra nằm trong `dogfood-output/`. Không có thông tin liên hệ thật và chưa triển khai public.
# clarte-design

