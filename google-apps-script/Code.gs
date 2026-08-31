// ============================================================
// API Tryout CPNS — Google Apps Script Web App
// Ditempel LANGSUNG di Google Sheet (Extensions > Apps Script),
// jadi tidak lagi bergantung ke layanan pihak ketiga (Sheety).
//
// Cara pakai:
//   GET  {URL}?sheet=soal        -> { "soal": [ {...}, {...} ] }
//   POST {URL}  body: { "sheet": "peserta", "data": { "nama": "...", ... } }
//        -> menambah 1 baris baru ke sheet tsb, kolom disesuaikan
//           otomatis dengan header baris 1 sheet tujuan.
// ============================================================

function doGet(e) {
  try {
    var sheetName = e.parameter.sheet;
    if (!sheetName) return jsonResponse({ error: 'Parameter sheet wajib diisi, contoh: ?sheet=soal' });

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) return jsonResponse({ error: 'Sheet tidak ditemukan: ' + sheetName });

    var hasil = {};
    hasil[sheetName] = sheetToObjects(sheet);
    return jsonResponse(hasil);
  } catch (err) {
    return jsonResponse({ error: String(err) });
  }
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var sheetName = body.sheet;
    var rowData = body.data;
    if (!sheetName || !rowData) {
      return jsonResponse({ error: 'Body wajib berisi "sheet" dan "data"' });
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) return jsonResponse({ error: 'Sheet tidak ditemukan: ' + sheetName });

    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var newRow = headers.map(function (h) {
      var v = rowData[h];
      return v === undefined || v === null ? '' : v;
    });
    sheet.appendRow(newRow);

    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ error: String(err) });
  }
}

// Ubah semua baris data (selain header) jadi array of object,
// key-nya mengikuti nama kolom di baris 1. Baris yang seluruh selnya
// kosong dilewati. Sel yang otomatis "kedeteksi" Google Sheets sebagai
// Tanggal (misal isinya "17 Agustus") dikembalikan jadi teks biasa,
// bukan ISO date string.
var TZ = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();

function formatCellValue(v) {
  if (v instanceof Date) {
    return Utilities.formatDate(v, TZ, 'd MMMM');
  }
  return v;
}

function sheetToObjects(sheet) {
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  var headers = values[0];
  var rows = values.slice(1);
  var hasil = [];

  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var isiSemuaKosong = row.every(function (c) { return c === '' || c === null; });
    if (isiSemuaKosong) continue;

    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = formatCellValue(row[j]);
    }
    hasil.push(obj);
  }
  return hasil;
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
