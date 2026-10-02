function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Sheet1") || ss.insertSheet("Sheet1");

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Bill No.",
        "Date",
        "M/s.",
        "Address",
        "PDF Name",
        "Entry Count",
        "Enclosed",
        "Checked By",
        "Action",
        "Entries JSON"
      ]);
    }

    if (!e || !e.parameter || !e.parameter.data) {
      return ContentService.createTextOutput("CTI Bill Google Sheets is working");
    }

    const data = JSON.parse(e.parameter.data);

    sheet.appendRow([
      new Date(),
      data.billNo || "",
      data.date || "",
      data.party || "",
      data.address || "",
      data.pdfName || "",
      data.entryCount || "",
      data.enclosed || "",
      data.checkedBy || "",
      data.action || "",
      JSON.stringify(data.rows || [])
    ]);

    SpreadsheetApp.flush();

    return ContentService.createTextOutput("DATA SAVED");
  } catch (error) {
    return ContentService.createTextOutput("ERROR");
  }
}
