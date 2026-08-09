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

## 3. Lộ Trình Triển Khai (Roadmap)

Quá trình xây dựng được chia thành 7 giai đoạn (Phase) nhằm tối ưu thời gian và chất lượng:

* **Phase 1: Phân tích & Thiết kế.** Chốt giao diện (UI/UX) và thiết kế Cấu trúc Dữ liệu (Database).
* **Phase 2 : Xây dựng Nền tảng.** Lập trình hệ thống phân quyền (Admin, Học viên) và cấu hình Server cơ sở.
* **Phase 3 : Module Thư viện.** Xây dựng hệ thống quản lý, phân loại và hiển thị tài liệu đa phương tiện.
* **Phase 4 : Hệ thống Khóa học (LMS).** Xây dựng trình phát video học tập, bài tập trắc nghiệm và theo dõi tiến độ học viên.
* **Phase 5: Thương mại & Đơn hàng.** Lập trình tính năng giỏ hàng, thanh toán và kích hoạt khóa học tự động.
* **Phase 6: Hoàn thiện & Tối ưu SEO.** Cập nhật nội dung, tối ưu tốc độ và tương thích di động.
* **Phase 7: Kiểm thử & Bàn giao.** UAT, hướng dẫn sử dụng và đưa website chạy chính thức (Go-live).

## 4. Tình Trạng Hiện Tại (Progress)

* **Hoàn thành:** Phân tích xong yêu cầu, chốt cấu trúc cơ sở dữ liệu và kế hoạch phát triển (Phase 1).
* **Đang thực hiện:** Khởi tạo bộ khung dự án (Next.js) và cấu hình môi trường lập trình (Đang vào Phase 2).

> [!NOTE]
> Mọi thay đổi hoặc đóng góp thêm về mặt tính năng từ phía đối tác xin vui lòng phản hồi trong giai đoạn Phase 1 và Phase 2 để đội ngũ tối ưu hệ thống một cách tốt nhất.

---
*Trân trọng!*
