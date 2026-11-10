# FitMate (Khỏe Cùng Bạn) – Hệ thống Quản lý Sức khỏe Cá nhân Tích hợp Chatbot AI (RAG) & Kết nối PT

**Môn học:** Kỹ nghệ Yêu cầu Phần mềm (Requirements Engineering) – Trường Đại học Công nghệ, ĐHQGHN  
**Giảng viên hướng dẫn:** TS. Đặng Đức Hạnh  
**Nhóm thực hiện:** Nhóm 3

| STT | Họ và tên | MSSV | Vai trò trong nhóm |
| :-: | :--- | :---: | :--- |
| 1 | **Doãn Minh Hải** | 24021454 | Nhóm trưởng (TV1) |
| 2 | **Lê Ngọc Hoàng Bình** | 24021390 | Thành viên (TV2) |
| 3 | **Lê Tuấn Anh** | 24021366 | Thành viên (TV3) |
| 4 | **Nguyễn Quang Trung** | 22028270 | Thành viên (TV4) |
| 5 | **Nguyễn Văn Hoàng** | 23021560 | Thành viên (TV5) |

---

## 📂 Cấu trúc Repository

1. **`FitMate_Assignment02_KeHoach_QuanLy_Nhom3.xlsx`**
   * File Excel quản lý toàn bộ đầu việc Assignment 02 theo 4 tuần, đối chiếu Rubric chấm điểm, chuẩn hóa danh mục 18 Use Cases (`UC-01`..`UC-18`), danh mục Mô hình hệ thống (`MOD-01`..`MOD-06`), 5 Kỹ thuật đánh giá yêu cầu (`EVAL-01`..`EVAL-05`) và biểu mẫu Checklist Inspection & Defect Log.
2. **`webapp/` (Nguyên mẫu Giao diện Tương tác 3 Phân hệ – Interactive UI Prototype)**
   * **`index.html`**: Giao diện Responsive chuẩn cho **User App (Mobile iOS/Android)**, **PT App (Mobile cho Huấn luyện viên)** và **Admin Web (Web Portal)**.
   * **`js/mock_data.js`**: Cơ sở dữ liệu giả lập bao phủ đủ 11 Thực thể miền (Entities) ở Phụ lục A (Hồ sơ người dùng, Mục tiêu, Bản ghi Apple HealthKit / Google Health Connect, CSDL món ăn Việt Nam của Viện Dinh Dưỡng, Kế hoạch tuần tự điều chỉnh, Kho tài liệu tri thức RAG, Hợp đồng giữ tiền trung gian Escrow...).
   * **`js/app.js`**: Bộ điều khiển trạng thái liên thông giữa 3 phân hệ, hiện thực hóa đầy đủ 18 Use Cases (`UC-01`..`UC-18`) và các yêu cầu `REQ-01`..`REQ-16`.
   * **`run_localhost.bat`**: File chạy nhanh máy chủ Localhost (`http://localhost:8080`) chỉ với 1 cú nhấp đúp chuột.
3. **`fitmate_ui_prototype.html`**
   * Bản đóng gói độc lập (All-in-One HTML) có thể mở trực tiếp trên mọi trình duyệt không cần cài đặt.

---

## 🚀 Hướng dẫn Chạy Giao diện trên Localhost

### Cách 1: Nhấp đúp chuột (Nhanh nhất trên Windows)
* Vào thư mục `webapp/` và nhấp đúp vào file **`run_localhost.bat`**. Trình duyệt sẽ tự động mở tại địa chỉ `http://localhost:8080`.

### Cách 2: Chạy bằng dòng lệnh (Terminal / PowerShell)
```bash
cd webapp
python -m http.server 8080
```
Sau đó mở trình duyệt truy cập: **http://localhost:8080**
