# Khảo sát sử dụng Dashboard HR Power BI

Khảo sát 10 bước (xác thực người trả lời → đánh giá 8 dashboard → đánh giá chung),
kết quả lưu về **Google Sheet** qua Google Apps Script (cùng cơ chế với `../index.html`
của bài quiz HC Plan 2027 — xem `../README.md` để hiểu chi tiết cơ chế chung).

## Vì sao đổi từ `window.storage` sang Google Sheet?

Bản gốc dùng `window.storage.get/set/list` — đây là kho dữ liệu dùng chung của nền
tảng Artifact, chỉ hoạt động khi trang được **publish thành Artifact có bật capability
lưu trữ**. Khi host file này như một trang tĩnh (GitHub Pages, server nội bộ...),
`window.storage` không tồn tại → không lưu được gì. Bản trong thư mục này thay bằng
Google Apps Script để chạy được trên bất kỳ hosting tĩnh nào.

## Cài đặt (làm 1 lần, ~5 phút)

1. **Tạo Google Sheet** — vd: `Khảo sát Dashboard HR – Kết quả`.
   - **Extensions → Apps Script** → xoá code mặc định → dán nội dung
     [`apps-script/Code.gs`](apps-script/Code.gs) → **Save**.
2. **Deploy Web App**
   - **Deploy → New deployment → Web app**.
   - *Execute as*: **Me** · *Who has access*: **Anyone**.
   - **Deploy**, cấp quyền khi được hỏi, copy **Web app URL** (`.../exec`).
3. **Gắn URL vào khảo sát**
   - Mở `index.html`, tìm `const SUBMIT_URL = '';` → dán URL vào giữa hai dấu nháy.
   - (Tuỳ chọn) đổi `ADMIN_CODE` — phải sửa **cả 2 nơi**: biến `ADMIN_CODE` trong
     `index.html` và trong `apps-script/Code.gs`, rồi **Deploy → Manage deployments →
     Edit → New version** để áp dụng.
   - Commit lên `main`, bật GitHub Pages (Settings → Pages → nguồn `main` / root)
     nếu chưa bật — dùng chung với bài quiz thì link sẽ là
     `https://mydanhho.github.io/hcplan-quiz/dashboard-survey/`.

## Cơ chế hoạt động

- Chọn tên → gọi `GET ?code=<mã NV>` để kiểm tra đã từng trả lời chưa (cho phép sửa lại).
- Bấm "Gửi khảo sát" → `POST` toàn bộ câu trả lời. Script tìm dòng có sẵn theo mã NV
  và **ghi đè** (không tạo dòng trùng) — nộp lại nhiều lần chỉ giữ lần gần nhất.
- Màn "Xem kết quả tổng hợp" → `GET ?adminCode=<mã>` — chỉ đúng mã mới trả dữ liệu.
  Đây là xác thực phía server thật, khác bản gốc (mã admin trước đây chỉ kiểm tra ở
  trình duyệt, chưa an toàn).

## Cấu trúc dữ liệu trong Sheet

Tab `Responses`, mỗi nhân viên 1 dòng:

| Mã NV | Họ tên | Store | Bộ phận | Chức danh | Thời gian nộp | AnswersJSON |

Cột `AnswersJSON` giữ toàn bộ câu trả lời (trạng thái/lý do từng dashboard, dashboard
hữu ích nhất/cần cải thiện, điểm hài lòng, góp ý) dưới dạng JSON — dùng cấu trúc này
để không phải đổi cột mỗi khi thêm/bớt dashboard.
