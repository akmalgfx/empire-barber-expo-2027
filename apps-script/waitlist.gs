/**
 * Empire Barber Expo 2027 · waitlist + vendor booth requests -> Google Sheet
 *
 * Setup: open the Sheet > Extensions > Apps Script, paste this file, then
 * Deploy > New deployment > Web app (Execute as: Me, Access: Anyone).
 * Copy the Web app URL into WAITLIST_ENDPOINT in assets/js/waitlist.js.
 *
 * Updating: paste the new code, then Deploy > Manage deployments > edit (pencil)
 * > Version: New version > Deploy. The Web app URL stays the same.
 */
const SHEET_NAME = 'Waitlist';       // created on first sign-up if missing
const VENDOR_SHEET_NAME = 'Vendors'; // created on first booth request if missing
const VENDOR_FIELDS = ['name', 'company', 'website', 'email', 'phone', 'products'];

function doPost(e) {
  const p = e.parameter || {};
  const email = String(p.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply({ ok: false });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (p.type === 'vendor') {
      const sheet = getSheet(ss, VENDOR_SHEET_NAME, ['Received', 'Name', 'Company', 'Website', 'Email', 'Phone', 'Products / Service']);
      // A leading = + - @ would run as a formula in the Sheet, so quote it
      const row = VENDOR_FIELDS.map((k) => String(p[k] || '').trim().slice(0, 2000).replace(/^[=+\-@]/, "'$&"));
      row[3] = email;
      if (!row[0] || !row[1]) return reply({ ok: false });
      sheet.appendRow([new Date(), ...row]);
      return reply({ ok: true });
    }

    const sheet = getSheet(ss, SHEET_NAME, ['Signed up', 'Email']);
    const last = sheet.getLastRow();
    const existing = last > 1 ? sheet.getRange(2, 2, last - 1, 1).getValues().flat() : [];
    if (!existing.includes(email)) sheet.appendRow([new Date(), email]);
    return reply({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

function getSheet(ss, name, header) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(header);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
