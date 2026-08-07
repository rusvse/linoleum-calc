function doGet(e) {
  const id = e.parameter.id;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('archive');

  if (!id) {
    // Возвращаем список архива
    if (!sheet) return ContentService.createTextOutput(JSON.stringify({ ok: true, items: [] })).setMimeType(ContentService.MimeType.JSON);

    const data = sheet.getDataRange().getValues();
    const items = [];
    // Пропускаем заголовок
    for (let i = 1; i < data.length; i++) {
      items.push({
        id: data[i][0],
        dateISO: data[i][1],
        projectName: data[i][2],
        material: data[i][3],
        units: data[i][4]
      });
    }
    items.reverse(); // Последние сверху
    return ContentService.createTextOutput(JSON.stringify({ ok: true, items })).setMimeType(ContentService.MimeType.JSON);
  }

  // Загружаем конкретный расчёт
  if (!sheet) return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'Архив не найден' })).setMimeType(ContentService.MimeType.JSON);

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      return ContentService.createTextOutput(JSON.stringify({
        ok: true,
        id: data[i][0],
        dateISO: data[i][1],
        projectName: data[i][2],
        material: data[i][3],
        units: data[i][4],
        apartments: JSON.parse(data[i][5] || '[]'),
        rows: JSON.parse(data[i][6] || '[]')
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'Расчёт не найден' })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('archive') || SpreadsheetApp.getActiveSpreadsheet().insertSheet('archive');

  // Добавляем заголовки если лист новый
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['id', 'dateISO', 'projectName', 'material', 'units', 'apartments', 'rows']);
  }

  const id = body.id || ('linoleum-' + Date.now());
  const dateISO = body.dateISO || new Date().toISOString();

  sheet.appendRow([
    id,
    dateISO,
    body.settings?.projectName || '',
    body.settings?.material || '',
    body.settings?.units || 'm',
    JSON.stringify(body.apartments || []),
    JSON.stringify(body.rows || [])
  ]);

  return ContentService.createTextOutput(JSON.stringify({ ok: true, id, dateISO }))
    .setMimeType(ContentService.MimeType.JSON);
}
