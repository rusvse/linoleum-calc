function doPost(e) {
  const body = JSON.parse(e.postData.contents);

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('archive') || SpreadsheetApp.getActiveSpreadsheet().insertSheet('archive');
  sheet.appendRow([new Date(), body.projectName, body.material, body.units, JSON.stringify(body.apartments)]);

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
