# hcplan-quiz
HC Plan 2027 Quiz — bài khảo sát / trắc nghiệm 25 câu, kết quả lưu về Google Sheet (cloud).

## Link khảo sát

Sau khi bật GitHub Pages (bước 3), link gửi cho người làm bài là:

**https://mydanhho.github.io/hcplan-quiz/**

Người làm bài nhập Họ tên, Mã NV, Bộ phận/Store (Email tùy chọn) → làm 25 câu → khi bấm
**Xem kết quả 🎯**, kết quả tự động được gửi lên Google Sheet. Nếu mất mạng, kết quả được giữ
tạm trên máy và có nút **Thử lại** (lần mở trang sau cũng tự gửi lại).

## Cài đặt nơi lưu kết quả (làm 1 lần, ~5 phút)

1. **Tạo Google Sheet**
   - Tạo một Google Sheet mới (vd: `HC Plan 2027 – Kết quả Quiz`).
   - Menu **Extensions (Tiện ích mở rộng) → Apps Script**.
   - Xóa code mặc định, dán toàn bộ nội dung file [`apps-script/Code.gs`](apps-script/Code.gs), bấm **Save**.

2. **Deploy Web App**
   - Bấm **Deploy → New deployment** → chọn type **Web app**.
   - *Execute as*: **Me** · *Who has access*: **Anyone**.
   - Bấm **Deploy**, cấp quyền (Authorize access) khi được hỏi.
   - Copy **Web app URL** (dạng `https://script.google.com/macros/s/.../exec`).

3. **Gắn URL vào bài quiz & bật link**
   - Mở `index.html`, tìm dòng `const SUBMIT_URL = '';` và dán URL vào giữa hai dấu nháy.
   - Commit lên nhánh `main`.
   - Trên GitHub: **Settings → Pages → Source: Deploy from a branch → `main` / `(root)`** → Save.
   - Sau 1–2 phút, link khảo sát ở trên hoạt động.

## Dữ liệu trong Sheet

Tab `Results` (tự tạo ở lần nộp đầu tiên), mỗi lượt làm bài là 1 dòng:

| Thời gian nộp | Họ và tên | Mã NV | Bộ phận / Store | Email | Điểm | Tổng câu | % | Xếp loại | Thời gian làm (giây) | Q1 … Q25 | User agent |

Cột `Q1…Q25` ghi đáp án đã chọn kèm đúng/sai, vd `B ✓`, `C ✗`.

> Nếu sửa `Code.gs` sau này: **Deploy → Manage deployments → Edit → Version: New version** để giữ nguyên URL.
