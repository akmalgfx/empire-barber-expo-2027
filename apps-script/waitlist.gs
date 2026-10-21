/**
 * Empire Barber Expo 2027 · waitlist sign-ups -> Google Sheet
 *
 * Setup: open the Sheet > Extensions > Apps Script, paste this file, then
 * Deploy > New deployment > Web app (Execute as: Me, Access: Anyone).
 * Copy the Web app URL into WAITLIST_ENDPOINT in assets/js/waitlist.js.
 */
const SHEET_NAME = 'Waitlist'; // created on first sign-up if missing

function doPost(e) {
  const email = String((e.parameter && e.parameter.email) || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply({ ok: false });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(['Signed up', 'Email']);
      sheet.setFrozenRows(1);
    }
    const last = sheet.getLastRow();
    const existing = last > 1 ? sheet.getRange(2, 2, last - 1, 1).getValues().flat() : [];
    if (!existing.includes(email)) sheet.appendRow([new Date(), email]);
    return reply({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
