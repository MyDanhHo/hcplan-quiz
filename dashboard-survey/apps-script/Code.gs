/**
 * Khảo sát sử dụng Dashboard HR Power BI — nhận kết quả và ghi vào Google Sheet.
 * Hướng dẫn triển khai: xem README.md trong thư mục dashboard-survey/.
 *
 * Thiết kế bảng: mỗi nhân viên = 1 dòng, cột "AnswersJSON" giữ toàn bộ câu trả lời
 * dưới dạng JSON (đơn giản hoá việc thêm/bớt dashboard sau này mà không cần đổi
 * cấu trúc cột). Nộp lại (resubmit) sẽ ghi đè lên dòng cũ của cùng mã NV.
 */
const SHEET_NAME = 'Responses';
const ADMIN_CODE = 'SP2026'; // đổi mã này nếu cần, phải khớp với ADMIN_CODE trong index.html

const HEADERS = ['Mã NV', 'Họ tên', 'Store', 'Bộ phận', 'Chức danh', 'Thời gian nộp', 'AnswersJSON'];

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function clean_(v, max) {
  let s = String(v == null ? '' : v).slice(0, max || 200);
  if (/^[=+\-@]/.test(s)) s = "'" + s; // chặn formula injection
  return s;
}

function findRowByCode_(sh, code) {
  const last = sh.getLastRow();
  if (last < 2) return -1;
  const codes = sh.getRange(2, 1, last - 1, 1).getValues();
  for (let i = 0; i < codes.length; i++) {
    if (String(codes[i][0]) === String(code)) return i + 2; // 1-indexed + header
  }
  return -1;
}

// ---------- POST: lưu / cập nhật câu trả lời của 1 nhân viên ----------
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const d = JSON.parse(e.postData.contents);
    if (!d.code || !d.name) return json_({ ok: false, error: 'Thiếu mã NV hoặc tên' });

    const sh = getSheet_();
    const row = [
      clean_(d.code, 30),
      clean_(d.name, 100),
      clean_(d.store, 100),
      clean_(d.dept, 150),
      clean_(d.pos, 60),
      new Date(),
      JSON.stringify(d.answers || {}),
    ];

    const existing = findRowByCode_(sh, d.code);
    if (existing > 0) {
      sh.getRange(existing, 1, 1, row.length).setValues([row]);
    } else {
      sh.appendRow(row);
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// ---------- GET ----------
// ?code=<ma NV>          -> trả về câu trả lời đã lưu của riêng người đó (để tiếp tục/sửa)
// ?adminCode=<ADMIN_CODE> -> trả về toàn bộ dữ liệu cho màn hình quản trị
// không có tham số        -> health check
function doGet(e) {
  const p = e.parameter || {};
  const sh = getSheet_();
  const last = sh.getLastRow();

  if (p.adminCode) {
    if (p.adminCode !== ADMIN_CODE) return json_({ ok: false, error: 'Sai mã truy cập' });
    if (last < 2) return json_({ ok: true, rows: [] });
    const data = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
    const rows = data.map(r => ({
      code: String(r[0]),
      name: r[1],
      store: r[2],
      dept: r[3],
      pos: r[4],
      submittedAt: r[5] instanceof Date ? r[5].toISOString() : String(r[5]),
      answers: safeParse_(r[6]),
    }));
    return json_({ ok: true, rows });
  }

  if (p.code) {
    const rowIdx = findRowByCode_(sh, p.code);
    if (rowIdx < 0) return json_({ ok: true, found: false });
    const r = sh.getRange(rowIdx, 1, 1, HEADERS.length).getValues()[0];
    return json_({ ok: true, found: true, answers: safeParse_(r[6]) });
  }

  return json_({ ok: true, service: 'hr-dashboard-survey' });
}

function safeParse_(s) {
  try { return JSON.parse(s) || {}; } catch (_) { return {}; }
}
