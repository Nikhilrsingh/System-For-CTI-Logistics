"use strict";

const GOOGLE_SHEETS_URL =
    "https://script.google.com/macros/s/AKfycbwq3ZOjM8UuBXLY4DmM9StguEvPkZmnDPWCSJwCpU9pZAnNFQ7Ff4jyMTO0Z67UpTAWcw/exec";

const MIN_ENTRIES = 1;
const MAX_ENTRIES = 10;

const ROW_HEIGHT = 28;
const FIXED_TABLE_BODY_HEIGHT = 327;

let currentEntryCount = 1;
let pdfNameManuallyChanged = false;


/* =====================================================
   HELPERS
===================================================== */

function $(id) {
    return document.getElementById(id);
}


function value(id) {
    const el = $(id);
    return el ? el.value.trim() : "";
}


function safe(v) {
    return String(v ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function num(v) {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
}


function dash(v) {
    return String(v ?? "").trim() || "-";
}


/* =====================================================
   DATE
===================================================== */

function formatDate(v) {

    const s = String(v || "").trim();

    if (!s) {
        return "-";
    }

    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    return m
        ? `${m[3]}/${m[2]}/${m[1]}`
        : s;
}


/* =====================================================
   TOTAL
===================================================== */

function amountTotal() {

    let rupees = 0;
    let paise = 0;

    readRows().forEach(r => {

        rupees += num(r.amountRs);
        paise += num(r.amountPs);

    });

    rupees += Math.floor(paise / 100);
    paise %= 100;

    return {
        rupees,
        paise,
        value: rupees + paise / 100
    };
}


/* =====================================================
   NUMBER TO WORDS
===================================================== */

const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen"
];


const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety"
];


function twoWords(n) {

    return n < 20
        ? ones[n]
        : tens[Math.floor(n / 10)] +
          (n % 10 ? " " + ones[n % 10] : "");
}


function threeWords(n) {

    if (n < 100) {
        return twoWords(n);
    }

    return (
        ones[Math.floor(n / 100)] +
        " Hundred" +
        (n % 100 ? " " + twoWords(n % 100) : "")
    );
}


function indianWords(n) {

    n = Math.floor(n);

    if (n === 0) {
        return "Zero";
    }

    const parts = [];

    const crore = Math.floor(n / 10000000);
    n %= 10000000;

    const lakh = Math.floor(n / 100000);
    n %= 100000;

    const thousand = Math.floor(n / 1000);
    n %= 1000;

    if (crore) {
        parts.push(indianWords(crore) + " Crore");
    }

    if (lakh) {
        parts.push(twoWords(lakh) + " Lakh");
    }

    if (thousand) {
        parts.push(twoWords(thousand) + " Thousand");
    }

    if (n) {
        parts.push(threeWords(n));
    }

    return parts.join(" ");
}


function amountInWords(total) {

    const rupees = Math.floor(num(total));

    const paise = Math.round(
        (num(total) - rupees) * 100
    );

    if (rupees === 0 && paise === 0) {
        return "-";
    }

    let text = indianWords(rupees);

    if (paise) {
        text +=
            " and " +
            twoWords(paise) +
            " Paise";
    }

    return text + " Only";
}


/* =====================================================
   CREATE INPUT ROW
===================================================== */

function createInputRow(index, data = {}) {

    const tr = document.createElement("tr");

    tr.innerHTML = `

        <td>${index}</td>

        <td>
            <input
                class="row-date"
                type="date"
                value="${safe(data.date || "")}"
            >
        </td>

        <td>
            <input
                class="row-gc"
                type="text"
                value="${safe(data.gcNote || "")}"
            >
        </td>

        <td>
            <input
                class="row-truck"
                type="text"
                value="${safe(data.truck || "")}"
            >
        </td>

        <td>
            <input
                class="row-from"
                type="text"
                value="${safe(data.from || "")}"
            >
        </td>

        <td>
            <input
                class="row-to"
                type="text"
                value="${safe(data.to || "")}"
            >
        </td>

        <td>
            <input
                class="row-hire"
                type="text"
                value="${safe(data.hire || "")}"
            >
        </td>

        <td>
            <input
                class="row-advance"
                type="text"
                value="${safe(data.advance || "")}"
            >
        </td>

        <td>
            <input
                class="row-balance"
                type="text"
                value="${safe(data.balance || "")}"
            >
        </td>

        <td>
            <input
                class="row-hamali"
                type="text"
                value="${safe(data.hamali || "")}"
            >
        </td>

        <td>
            <input
                class="row-halting"
                type="text"
                value="${safe(data.halting || "")}"
            >
        </td>

        <td>
            <input
                class="row-amount-rs"
                type="text"
                value="${safe(data.amountRs || "")}"
            >
        </td>

        <td>
            <input
                class="row-amount-ps"
                type="text"
                value="${safe(data.amountPs || "")}"
            >
        </td>

    `;

    return tr;
}


/* =====================================================
   READ ROW
===================================================== */

function readRow(row) {

    const get = selector =>
        row.querySelector(selector)?.value.trim() || "";

    return {

        date: get(".row-date"),

        gcNote: get(".row-gc"),

        truck: get(".row-truck"),

        from: get(".row-from"),

        to: get(".row-to"),

        hire: get(".row-hire"),

        advance: get(".row-advance"),

        balance: get(".row-balance"),

        hamali: get(".row-hamali"),

        halting: get(".row-halting"),

        amountRs: get(".row-amount-rs"),

        amountPs: get(".row-amount-ps")

    };
}


/* =====================================================
   READ ALL ROWS
===================================================== */

function readRows() {

    return Array.from(
        document.querySelectorAll(
            "#entryInputBody tr"
        )
    ).map(readRow);

}


/* =====================================================
   BUILD INPUT ROWS
===================================================== */

function buildInputRows(
    count,
    existingRows = null
) {

    const body = $("entryInputBody");

    if (!body) {
        return;
    }

    currentEntryCount =
        Math.max(
            MIN_ENTRIES,
            Math.min(
                MAX_ENTRIES,
                Number(count) || 1
            )
        );

    const rowsToUse =
        existingRows || readRows();

    body.innerHTML = "";

    for (
        let i = 0;
        i < currentEntryCount;
        i++
    ) {

        body.appendChild(
            createInputRow(
                i + 1,
                rowsToUse[i] || {}
            )
        );

    }
}


/* =====================================================
   UPDATE PREVIEW
===================================================== */

function updatePreview() {

    $("outParty").textContent =
        dash(value("inParty"));

    $("outPartyAddress").textContent =
        dash(value("inPartyAddress"));

    $("outBillNo").textContent =
        dash(value("inBillNo"));

    $("outBillDate").textContent =
        formatDate(value("inBillDate"));

    $("outEnclosed").textContent =
        dash(value("inEnclosed"));

    $("outCheckedBy").textContent =
        dash(value("inCheckedBy"));


    const preview = $("previewBody");

    preview.innerHTML = "";


    const rows = readRows();


    rows.forEach((r, i) => {

        const tr =
            document.createElement("div");

        tr.className = "table-row";

        tr.style.top =
            (i * ROW_HEIGHT) + "px";


        tr.innerHTML = `

            <div>
                ${i + 1}
            </div>

            <div>
                ${safe(
                    dash(
                        formatDate(r.date)
                    )
                )}
            </div>

            <div>
                ${safe(dash(r.gcNote))}
            </div>

            <div>
                ${safe(dash(r.truck))}
            </div>

            <div>
                ${safe(dash(r.from))}
            </div>

            <div>
                ${safe(dash(r.to))}
            </div>

            <div>
                ${safe(dash(r.hire))}
            </div>

            <div>
                ${safe(dash(r.advance))}
            </div>

            <div>
                ${safe(dash(r.balance))}
            </div>

            <div>
                ${safe(dash(r.hamali))}
            </div>

            <div>
                ${safe(dash(r.halting))}
            </div>

            <div>
                ${safe(dash(r.amountRs))}
            </div>

            <div>
                ${safe(dash(r.amountPs))}
            </div>

        `;

        preview.appendChild(tr);

    });


    /* TOTAL */

    const total = amountTotal();

    const totalEl = $("outTotal");


    const totalText =
        total.value === 0
            ? "-"
            : (
                total.paise
                    ? `${total.rupees}.${String(total.paise).padStart(2, "0")}`
                    : String(total.rupees)
            );


    totalEl.textContent = totalText;


    if (totalText.length > 9) {

        totalEl.style.fontSize = "7px";

    } else if (totalText.length > 7) {

        totalEl.style.fontSize = "8px";

    } else if (totalText.length > 6) {

        totalEl.style.fontSize = "9px";

    } else {

        totalEl.style.fontSize = "11px";

    }


    $("outRupees").textContent =
        amountInWords(total.value);
}


/* =====================================================
   AUTO PDF NAME
===================================================== */

function updateAutoPdfName() {

    const pdf = $("inPdfName");

    if (!pdf || pdfNameManuallyChanged) {
        return;
    }

    const auto = [
        value("inBillNo"),
        value("inParty")
    ]
        .filter(Boolean)
        .join("-");

    pdf.value = auto;
}


/* =====================================================
   SAVE TO GOOGLE SHEETS
   ONLY CALLED BY:
   PDF / PRINT / SHARE
===================================================== */

function saveToSheets(action) {

    try {

        if (!GOOGLE_SHEETS_URL) {
            return;
        }


        const get = id => {

            const el =
                document.getElementById(id);

            return el
                ? el.value.trim()
                : "";

        };


        const rows = readRows();


        /*
           UNIQUE REQUEST ID

           This prevents accidental duplicate
           requests from being treated as the
           same save.
        */

        const requestId =
            action +
            "-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 10);


        const data = {

            billNo:
                get("inBillNo"),

            date:
                get("inBillDate"),

            party:
                get("inParty"),

            address:
                get("inPartyAddress"),

            pdfName:
                getPDFName(),

            enclosed:
                get("inEnclosed"),

            checkedBy:
                get("inCheckedBy"),

            action:
                action,

            requestId:
                requestId,

            rows:
                rows

        };


        const url =
            GOOGLE_SHEETS_URL +
            "?data=" +
            encodeURIComponent(
                JSON.stringify(data)
            );


        /*
           Hidden iframe.
           Does not block PDF / Print / Share.
        */

        const iframe =
            document.createElement("iframe");


        iframe.style.display = "none";

        iframe.style.width = "0";

        iframe.style.height = "0";

        iframe.style.border = "0";

        iframe.src = url;


        document.body.appendChild(
            iframe
        );


        /*
           Remove iframe quickly.
        */

        setTimeout(() => {

            if (iframe.parentNode) {
                iframe.remove();
            }

        }, 1500);


    } catch (_) {

        /*
           Completely silent.
        */

        return;
    }
}


/* =====================================================
   PDF FILE NAME
===================================================== */

function getPDFName() {

    let name =
        value("inPdfName");


    if (!name) {

        name =
            [
                value("inBillNo"),
                value("inParty")
            ]
                .filter(Boolean)
                .join("-")
            || "Bill";

    }


    name =
        name.replace(
            /[<>:"/\\|?*]/g,
            "-"
        );


    return name
        .toLowerCase()
        .endsWith(".pdf")
        ? name
        : name + ".pdf";
}


/* =====================================================
   CREATE COMPRESSED PDF
===================================================== */

async function makePDF() {

    updatePreview();


    const canvas =
        await html2canvas(
            $("billPage"),
            {

                scale: 1.5,

                useCORS: true,

                backgroundColor: "#fff",

                logging: false

            }
        );


    const { jsPDF } =
        window.jspdf;


    const pdf =
        new jsPDF({

            orientation:
                "landscape",

            unit:
                "pt",

            format:
                "a4",

            compress:
                true

        });


    /*
       JPEG instead of PNG.
       This reduces PDF size considerably.
    */

    const image =
        canvas.toDataURL(
            "image/jpeg",
            0.72
        );


    pdf.addImage(

        image,

        "JPEG",

        0,

        0,

        pdf.internal.pageSize.getWidth(),

        pdf.internal.pageSize.getHeight(),

        undefined,

        "FAST"

    );


    return pdf;
}


/* =====================================================
   GENERATE PDF
===================================================== */

async function generatePDF() {

    const button =
        $("btnGenerate");


    if (button.disabled) {
        return;
    }


    button.disabled = true;


    try {

        /*
           Start Google Sheet save
           without waiting for it.
        */

        saveToSheets("PDF");


        /*
           Immediately create PDF.
        */

        const pdf =
            await makePDF();


        /*
           Immediately download.
        */

        pdf.save(
            getPDFName()
        );


    } catch (_) {

        /*
           No error message.
        */

        return;


    } finally {

        button.disabled = false;

    }
}


/* =====================================================
   SHARE PDF
===================================================== */

async function sharePDF() {

    const button =
        $("btnShare");


    if (button.disabled) {
        return;
    }


    button.disabled = true;


    try {

        /*
           Save silently.
        */

        saveToSheets("SHARE");


        /*
           Create PDF.
        */

        const pdf =
            await makePDF();


        /*
           Convert to actual PDF file.
        */

        const file =
            new File(

                [
                    pdf.output("blob")
                ],

                getPDFName(),

                {
                    type:
                        "application/pdf"
                }

            );


        /*
           Native share sheet.
        */

        if (

            navigator.share &&

            navigator.canShare &&

            navigator.canShare({
                files: [file]
            })

        ) {

            await navigator.share({

                title:
                    getPDFName()
                        .replace(
                            /\.pdf$/i,
                            ""
                        ),

                files:
                    [file]

            });


        } else {

            /*
               Fallback:
               download PDF.
            */

            pdf.save(
                getPDFName()
            );

        }


    } catch (_) {

        /*
           User cancelled share
           or any other error.
           Stay completely silent.
        */

        return;


    } finally {

        button.disabled = false;

    }
}


/* =====================================================
   EVENTS
===================================================== */

function setupEvents() {


    /*
       MAIN BILL FIELDS
    */

    [

        "inParty",
        "inPartyAddress",
        "inBillNo",
        "inBillDate",
        "inEnclosed",
        "inCheckedBy"

    ].forEach(id => {

        const el = $(id);

        if (!el) {
            return;
        }


        el.addEventListener(
            "input",
            () => {

                updateAutoPdfName();

                updatePreview();

            }
        );


        el.addEventListener(
            "change",
            () => {

                updateAutoPdfName();

                updatePreview();

            }
        );

    });


    /*
       MANUAL PDF NAME
    */

    const pdf =
        $("inPdfName");


    if (pdf) {

        pdf.addEventListener(
            "input",
            () => {

                pdfNameManuallyChanged =
                    true;

            }
        );

    }


    /*
       ENTRY INPUTS
    */

    $("entryInputBody")
        .addEventListener(
            "input",
            e => {

                if (
                    e.target.matches("input")
                ) {

                    updatePreview();

                }

            }
        );


    $("entryInputBody")
        .addEventListener(
            "change",
            e => {

                if (
                    e.target.matches("input")
                ) {

                    updatePreview();

                }

            }
        );


    /*
       ENTRY COUNT

       IMPORTANT:
       NO GOOGLE SHEETS SAVE HERE.
    */

    $("rowCount")
        .addEventListener(
            "change",
            () => {

                const rows =
                    readRows();


                buildInputRows(
                    $("rowCount").value,
                    rows
                );


                updatePreview();

            }
        );


    /*
       ADD ENTRY

       NO GOOGLE SHEETS SAVE.
    */

    $("btnAddRow")
        .addEventListener(
            "click",
            () => {

                if (
                    currentEntryCount >=
                    MAX_ENTRIES
                ) {

                    return;

                }


                const rows =
                    readRows();


                currentEntryCount++;


                $("rowCount").value =
                    String(
                        currentEntryCount
                    );


                buildInputRows(
                    currentEntryCount,
                    rows
                );


                updatePreview();

            }
        );


    /*
       REMOVE ENTRY

       NO GOOGLE SHEETS SAVE.
    */

    $("btnRemoveRow")
        .addEventListener(
            "click",
            () => {

                if (
                    currentEntryCount <=
                    MIN_ENTRIES
                ) {

                    return;

                }


                const rows =
                    readRows()
                        .slice(
                            0,
                            currentEntryCount - 1
                        );


                currentEntryCount--;


                $("rowCount").value =
                    String(
                        currentEntryCount
                    );


                buildInputRows(
                    currentEntryCount,
                    rows
                );


                updatePreview();

            }
        );


    /*
       RESET

       NO GOOGLE SHEETS SAVE.
    */

    $("btnReset")
        .addEventListener(
            "click",
            () => {


                [

                    "inParty",
                    "inPartyAddress",
                    "inBillNo",
                    "inBillDate",
                    "inPdfName",
                    "inEnclosed",
                    "inCheckedBy"

                ].forEach(id => {

                    const el = $(id);

                    if (el) {
                        el.value = "";
                    }

                });


                pdfNameManuallyChanged =
                    false;


                currentEntryCount =
                    1;


                $("rowCount").value =
                    "1";


                buildInputRows(
                    1,
                    []
                );


                updatePreview();

            }
        );


    /*
       GENERATE
    */

    $("btnGenerate")
        .addEventListener(
            "click",
            generatePDF
        );


    /*
       PRINT

       Save starts in background,
       print starts immediately.
    */

    $("btnPrint")
        .addEventListener(
            "click",
            () => {

                saveToSheets("PRINT");

                window.print();

            }
        );


    /*
       SHARE
    */

    $("btnShare")
        .addEventListener(
            "click",
            sharePDF
        );

}


/* =====================================================
   INITIALIZE
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        buildInputRows(
            1,
            []
        );


        setupEvents();


        updateAutoPdfName();


        updatePreview();

    }
);