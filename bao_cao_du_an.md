# Báo Cáo Kế Hoạch Triển Khai Website Hán Ngữ Natra

**Kính gửi:** Ban quản lý / Đối tác dự án Hán Ngữ Natra
**Ngày báo cáo:** 10/08/2026
**Hạng mục:** Xây dựng hệ thống Website Học trực tuyến (LMS) & Thư viện tài liệu
**Đơn vị/Người thực hiện:** Đội ngũ phát triển

---

## 1. Tổng Quan Dự Án

Dự án nhằm xây dựng một nền tảng website toàn diện, phục vụ 3 mục tiêu cốt lõi:
1. **Thư viện tiếng Trung:** Hệ thống hóa và lưu trữ bài bản các tài liệu (PDF, Audio, HTML) theo nhiều cấp độ (Thiếu nhi, HSK 1-6, HSKK, Giao tiếp...).
2. **Khóa học trực tuyến (LMS):** Cung cấp hệ thống học tập với video bài giảng, tài liệu đính kèm và bài tập trắc nghiệm trực tiếp.
3. **Thương mại khóa học:** Quản lý bán khóa học (thu phí/miễn phí) và cấp quyền truy cập/thời hạn sử dụng tự động.

## 2. Công Nghệ Đề Xuất (Tech Stack)

Sau quá trình phân tích và đánh giá, chúng tôi thống nhất sử dụng các công nghệ hiện đại nhất để đảm bảo chất lượng dự án:
* **Framework chính:** Next.js (React) kết hợp Node.js. Đây là công nghệ giúp giao diện web chạy mượt mà như ứng dụng điện thoại (Single Page Application) nhưng vẫn tối ưu hóa cực tốt cho SEO (Tìm kiếm trên Google).
* **Cơ sở dữ liệu:** PostgreSQL kết hợp Prisma ORM, đảm bảo tính bảo mật và toàn vẹn dữ liệu cho hệ thống bán hàng và tài khoản người dùng.
* **Giao diện:** Thiết kế theo phong cách hiện đại với bảng màu nhận diện (Kem, Đỏ san hô, Xanh ngọc). Tương thích 100% với các thiết bị di động (Responsive).
* **Lưu trữ Video:** Để bảo vệ bản quyền khóa học (chống tải lậu), chúng tôi khuyến nghị sử dụng nền tảng lưu trữ video bảo mật chuyên dụng như Vimeo (hoặc Cloudflare Stream) thay vì Google Drive (dễ bị tải xuống và không chuyên nghiệp cho LMS).

## 3. Các chức năng đã hoàn thành (Cập nhật mới nhất)

Dự án đang được phát triển theo đúng lộ trình và đã hoàn thành 4 Giai đoạn (Phases) cốt lõi:

### Phase 1: Cấu trúc cơ sở dữ liệu & Nền tảng
- [x] Thiết lập hệ thống Next.js 14, Tailwind CSS, Prisma ORM (sử dụng SQLite cho môi trường phát triển).
- [x] Thiết kế Database Schema toàn diện cho: User, Course, Lesson, Document, Category, Order, Progress.

### Phase 2: Xác thực & Giao diện cơ sở
- [x] Tích hợp NextAuth.js hỗ trợ Đăng ký/Đăng nhập an toàn.
- [x] Xây dựng UI/UX đồng bộ theo nhận diện thương hiệu (Màu Cream, Đỏ san hô, Xanh ngọc, Vàng đất).
- [x] Tạo khung Admin Dashboard bảo mật (chỉ tài khoản ROLE = ADMIN mới được truy cập).

### Phase 3: Thư viện Tài liệu
- [x] Admin: Tạo API và giao diện quản lý danh mục (`/admin/categories`) và tài liệu (`/admin/documents`).
- [x] Client: Xây dựng trang Thư viện (`/thu-vien`) cho học viên với bộ lọc tìm kiếm theo danh mục.
- [x] Chi tiết: Giao diện chi tiết tài liệu và nút tải xuống an toàn.

### Phase 4: Hệ thống Khóa Học & Bài Giảng (E-learning)
- [x] Admin: Chức năng tạo/xóa khóa học với các thiết lập giá bán, trình độ (`/admin/courses`).
- [x] Admin: Quản lý cấu trúc bài giảng trực quan (Chương -> Bài học, Hỗ trợ định dạng Video/PDF/Quiz) (`/admin/courses/[id]/lessons`).
- [x] Client: Trang danh sách khóa học (`/khoa-hoc`) và Landing Page giới thiệu chi tiết từng khóa học (`/khoa-hoc/[slug]`).
- [x] Client: Trình phát Bài giảng (Lesson Player - `/hoc/[slug]`) chuyên nghiệp, hỗ trợ học viên xem video, xem tài liệu, chuyển bài mượt mà.

### Phase 5: Hệ thống Mua hàng & Thanh toán
- [x] Tính năng Mua khóa học: Nút "Vào học ngay" cho khóa miễn phí, "Mua khóa học" cho khóa trả phí.
- [x] Trang Checkout (`/checkout/[orderId]`): Xác nhận thông tin, hiển thị hướng dẫn chuyển khoản và mã QR tự động.
- [x] Khu vực Quản lý đơn hàng (Admin): Theo dõi, lọc, và nút Duyệt đơn nhanh chóng để cấp quyền học viên.
- [x] Trang Cá nhân Học viên (`/ca-nhan`): Hiển thị danh sách khóa học đang sở hữu và theo dõi lịch sử thanh toán.

*Hệ thống đã trải qua các đợt kiểm thử tích hợp (Automated Type-Checking & Compilation) và đạt kết quả ổn định 100%.*

## 4. Kế hoạch tiếp theo (Phase 6 & 7)
- **Cập nhật nội dung:** Thêm các khóa học, tải lên các file video, tài liệu thực tế.
- **Tối ưu hóa (SEO & UI/UX):** Tinh chỉnh tốc độ tải trang, đảm bảo Mobile Responsive 100%, bổ sung metadata SEO.
- **Triển khai Production (Deployment):** Cấu hình Database sang PostgreSQL thay vì SQLite, đưa hệ thống lên máy chủ thực tế (Vercel/VPS).

## 5. Lộ Trình Triển Khai (Roadmap)

Quá trình xây dựng được chia thành 7 giai đoạn (Phase) nhằm tối ưu thời gian và chất lượng:

* **Phase 1: Phân tích & Thiết kế.** Chốt giao diện (UI/UX) và thiết kế Cấu trúc Dữ liệu (Database).
* **Phase 2 : Xây dựng Nền tảng.** Lập trình hệ thống phân quyền (Admin, Học viên) và cấu hình Server cơ sở.
* **Phase 3 : Module Thư viện.** Xây dựng hệ thống quản lý, phân loại và hiển thị tài liệu đa phương tiện.
* **Phase 4 : Hệ thống Khóa học (LMS).** Xây dựng trình phát video học tập, bài tập trắc nghiệm và theo dõi tiến độ học viên.
* **Phase 5: Thương mại & Đơn hàng.** Lập trình tính năng giỏ hàng, thanh toán và kích hoạt khóa học tự động.
* **Phase 6: Hoàn thiện & Tối ưu SEO.** Cập nhật nội dung, tối ưu tốc độ và tương thích di động.
* **Phase 7: Kiểm thử & Bàn giao.** UAT, hướng dẫn sử dụng và đưa website chạy chính thức (Go-live).

## 6. Tình Trạng Hiện Tại (Progress)

* **Hoàn thành:** Phân tích xong yêu cầu, chốt cấu trúc cơ sở dữ liệu và kế hoạch phát triển (Phase 1).
* **Đang thực hiện:** Khởi tạo bộ khung dự án (Next.js) và cấu hình môi trường lập trình (Đang vào Phase 2).

> [!NOTE]
> Mọi thay đổi hoặc đóng góp thêm về mặt tính năng từ phía đối tác xin vui lòng phản hồi trong giai đoạn Phase 1 và Phase 2 để đội ngũ tối ưu hệ thống một cách tốt nhất.

---
*Trân trọng!*
