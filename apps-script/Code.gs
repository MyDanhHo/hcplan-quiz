/**
 * HC Plan 2027 Quiz — nhận kết quả và ghi vào Google Sheet.
 * Hướng dẫn triển khai: xem README.md ở thư mục gốc repo.
 */
const SHEET_NAME = 'Results';
const QUESTION_COUNT = 25;

function headers_() {
  const base = ['Thời gian nộp', 'Họ và tên', 'Mã NV', 'Bộ phận / Store', 'Email',
                'Điểm', 'Tổng câu', '%', 'Xếp loại', 'Thời gian làm (giây)'];
  for (let i = 1; i <= QUESTION_COUNT; i++) base.push('Q' + i);
  base.push('User agent');
  return base;
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(headers_());
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, sh.getLastColumn()).setFontWeight('bold');
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function clean_(v, max) {
  // Chặn công thức (formula injection) và giới hạn độ dài
  let s = String(v == null ? '' : v).slice(0, max || 200);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const d = JSON.parse(e.postData.contents);
    if (!d.name || !d.empId) return json_({ ok: false, error: 'Thiếu thông tin người làm bài' });

    const answers = Array.isArray(d.answers) ? d.answers : [];
    const qCols = [];
    for (let i = 0; i < QUESTION_COUNT; i++) {
      const a = answers[i];
      qCols.push(a && a.chosen ? clean_(a.chosen, 2) + (a.correct ? ' ✓' : ' ✗') : '');
    }

    getSheet_().appendRow([
      new Date(),
      clean_(d.name, 100),
      clean_(d.empId, 30),
      clean_(d.dept, 100),
      clean_(d.email, 120),
      Number(d.score) || 0,
      Number(d.total) || QUESTION_COUNT,
      Number(d.percent) || 0,
      clean_(d.grade, 30),
      Number(d.durationSec) || 0,
    ].concat(qCols, [clean_(d.userAgent, 300)]));

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json_({ ok: true, service: 'hcplan-quiz' });
}
