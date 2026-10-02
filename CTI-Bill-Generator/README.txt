CTI BILL GENERATOR

1. Keep the folder structure unchanged.
2. Run the folder with your normal local server.
3. Create/open the Google Sheet for CTI Bill Data.
4. Open Extensions -> Apps Script.
5. Paste the code from Google Apps Script/Code.gs and save it.
6. Deploy -> New deployment -> Web app.
7. Execute as: Me.
8. Who has access: Anyone.
9. Deploy and copy the /exec web-app URL.
10. Open js/bill.js and replace:
    PASTE_NEW_APPS_SCRIPT_WEB_APP_URL_HERE
    with the deployed /exec URL.
11. Save and refresh the Bill Generator.

SILENT GOOGLE SHEETS LOGGING
- Generate PDF -> action: PDF
- Print -> action: PRINT
- Share -> action: SHARE
- Reset -> action: RESET
- Add Entry -> action: ADD_ENTRY
- Remove Entry -> action: REMOVE_ENTRY
- Number of Entries change -> action: ENTRY_COUNT

The Google Sheets request is intentionally silent. The page does not show a saved/saving message and ignores save failures.

BILL BEHAVIOUR
- 1 to 10 entries.
- Entry data is preserved when the entry count is changed.
- Main bill date and every entry date use a date picker.
- Blank bill values display as '-'.
- Only entered rows receive horizontal row lines; unused space remains blank with fixed vertical column lines.
- Bill No. is on the M/s. line at the right; Date is below it on the address line.
- PDF name automatically uses Bill No.-Party and remains editable after manual editing.
