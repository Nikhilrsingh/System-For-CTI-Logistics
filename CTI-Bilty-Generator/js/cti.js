/* =====================================================
   GOOGLE SHEETS
===================================================== */

const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbxIiUSjmyB8afNdHWuFhpmD7MTs_RBHbYYk8bN-VC0VUHslLpTMmFVCjN8qW0Tab76RpQ/exec";

/* =====================================================
   SAVE BILTY DATA TO GOOGLE SHEETS
===================================================== */

/* =====================================================
   SAVE BILTY DATA TO GOOGLE SHEETS
===================================================== */

function saveBiltyToGoogleSheets(action) {

    if (!GOOGLE_SHEETS_URL) return;

    const getFieldValue = (id) => {
        const element = document.getElementById(id);
        return element ? element.value.trim() : "";
    };

    const data = {
        grNo: getFieldValue("inGR"),
        date: getFieldValue("inDate"),
        from: getFieldValue("inFrom"),
        to: getFieldValue("inTo"),
        lorry: getFieldValue("inLorry"),
        consignor: getFieldValue("inConsignor"),
        consignee: getFieldValue("inConsignee"),
        packages: getFieldValue("inPkg"),
        nature: getFieldValue("inNature"),
        value: getFieldValue("inValue"),
        invoice: getFieldValue("inInvoice"),
        eway: getFieldValue("inEway"),
        deliveryAt: getFieldValue("inDeliveryAt"),
        pdfName: getFieldValue("inPdfName"),
        action: action
    };

    const url =
        GOOGLE_SHEETS_URL +
        "?data=" +
        encodeURIComponent(JSON.stringify(data));

    const iframe = document.createElement("iframe");

    iframe.style.display = "none";

    iframe.src = url;

    document.body.appendChild(iframe);

    setTimeout(() => {
        iframe.remove();
    }, 3000);
}

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       HELPERS
    ===================================================== */

    const $ = (id) => document.getElementById(id);

    function getValue(id) {
        const el = $(id);
        return el ? el.value : "";
    }

    function setText(id, value) {
        const el = $(id);
        if (el) el.textContent = value || "";
    }

    function formatDate(value) {
        if (!value) return "";

        const parts = value.split("-");
        if (parts.length !== 3) return value;

        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }


    /* =====================================================
       INPUT → OUTPUT MAP
    ===================================================== */

    const fieldMap = {
        inFrom: "outFrom",
        inTo: "outTo",
        inLorry: "outLorry",
        inDate: "outDate",
        inGR: "outGR",

        inConsignor: "outConsignor",
        inConsignorAddr: "outConsignorAddr",
        inConsignorGST: "outConsignorGST",

        inConsignee: "outConsignee",
        inConsigneeAddr: "outConsigneeAddr",
        inConsigneeGST: "outConsigneeGST",

        inPkg: "outPkg",
        inNature: "outNature",

        inChargeWeight: "outChargeWeight",
        inTbb: "outTbb",
        inSCharge: "outSCharge",
        inStChargeRs: "outStChargeRs",
        inStChargeP: "outStChargeP",

        inValue: "outValue",
        inInvoice: "outInvoice",
        inEway: "outEway",
        inDeliveryAt: "outDeliveryAt"
    };


    /* =====================================================
       DEFAULT STYLE FOR EVERY INPUT

       Normal fields = 15px
       GR No.       = 20px
       Packages     = 18px
       Nature       = 18px
       Value        = 18px
    ===================================================== */

    const fieldStyle = {
        inFrom:          { size: 15, color: "#124973" },
        inTo:            { size: 15, color: "#124973" },
        inLorry:         { size: 15, color: "#124973" },
        inDate:          { size: 15, color: "#872222" },
        inGR:            { size: 20, color: "#872222" },

        inConsignor:     { size: 15, color: "#000000" },
        inConsignorAddr: { size: 15, color: "#000000" },
        inConsignorGST:  { size: 15, color: "#000000" },

        inConsignee:     { size: 15, color: "#000000" },
        inConsigneeAddr: { size: 15, color: "#000000" },
        inConsigneeGST:  { size: 15, color: "#000000" },

        inPkg:           { size: 18, color: "#872222" },
        inNature:        { size: 18, color: "#872222" },

        inChargeWeight:  { size: 15, color: "#000000" },
        inTbb:           { size: 15, color: "#000000" },
        inSCharge:       { size: 15, color: "#000000" },
        inStChargeRs:    { size: 15, color: "#000000" },
        inStChargeP:     { size: 15, color: "#000000" },

        inValue:         { size: 18, color: "#c00000" },
        inInvoice:       { size: 15, color: "#124973" },
        inEway:          { size: 15, color: "#124973" },
        inDeliveryAt:    { size: 15, color: "#124973" }
    };


    /* =====================================================
       TEXT FITTING

       The selected size is the requested size.
       If the text is too long for its fixed box, it is
       automatically reduced only as much as necessary so
       it never gets cut or paints over another block.
    ===================================================== */

    function fitOutput(output, requestedSize) {
        if (!output) return;

        let size = Number(requestedSize) || 15;

        output.style.fontSize = `${size}px`;

        // Allow the browser to recalculate dimensions.
        void output.offsetWidth;

        const canWrap =
            output.classList.contains("party-address-line") === false &&
            output.classList.contains("party-gst-line") === false;

        if (!canWrap) {
            output.style.whiteSpace = "nowrap";
        }

        let guard = 0;

        while (
            output.scrollWidth > output.clientWidth + 1 &&
            size > 9 &&
            guard < 30
        ) {
            size -= 0.5;
            output.style.fontSize = `${size}px`;
            guard++;
        }
    }


    function applyFieldStyle(fieldId) {
        const outputId = fieldMap[fieldId];
        const output = $(outputId);
        const box = document.querySelector(
            `.input-box[data-field="${fieldId}"]`
        );

        if (!output || !box) return;

        const select = box.querySelector(".field-tools select");
        const color = box.querySelector('input[type="color"]');
        const bold = box.querySelector(".bold-btn");

        const requestedSize =
            select ? Number(select.value) : (fieldStyle[fieldId]?.size || 15);

        const chosenColor =
            color ? color.value : (fieldStyle[fieldId]?.color || "#000000");

        output.style.color = chosenColor;
        output.style.fontWeight =
            bold && bold.classList.contains("active") ? "700" : "400";

        fitOutput(output, requestedSize);
    }


    /* =====================================================
       BUILD FORMAT CONTROLS
    ===================================================== */

    document
        .querySelectorAll(".input-box[data-field]")
        .forEach((box) => {

            const fieldId = box.dataset.field;
            const input = $(fieldId);
            const tools = box.querySelector(".field-tools");

            if (!input || !tools || !fieldMap[fieldId]) return;

            const defaults = fieldStyle[fieldId] || {
                size: 15,
                color: "#000000"
            };


            /* FONT SIZE */

            const sizeSelect = document.createElement("select");
            sizeSelect.title = "Change bilty font size";

            [9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24, 26, 28].forEach((size) => {
                const option = document.createElement("option");
                option.value = String(size);
                option.textContent = `${size}px`;

                if (size === defaults.size) {
                    option.selected = true;
                }

                sizeSelect.appendChild(option);
            });


            /* COLOUR */

            const colorInput = document.createElement("input");
            colorInput.type = "color";
            colorInput.value = defaults.color;
            colorInput.title = "Change bilty text colour";


            /* BOLD */

            const boldButton = document.createElement("button");
            boldButton.type = "button";
            boldButton.className = "bold-btn";
            boldButton.textContent = "B";
            boldButton.title = "Bold / Normal";


            tools.appendChild(sizeSelect);
            tools.appendChild(colorInput);
            tools.appendChild(boldButton);


            sizeSelect.addEventListener("change", () => {
                applyFieldStyle(fieldId);
            });

            colorInput.addEventListener("input", () => {
                applyFieldStyle(fieldId);
            });

            boldButton.addEventListener("click", () => {
                boldButton.classList.toggle("active");
                applyFieldStyle(fieldId);
            });

            // Apply the correct default immediately on page load.
            applyFieldStyle(fieldId);
        });


    /* =====================================================
       UPDATE BILTY
    ===================================================== */

    function updateBilty() {

        setText("outFrom", getValue("inFrom"));
        setText("outTo", getValue("inTo"));
        setText("outLorry", getValue("inLorry"));
        setText("outDate", formatDate(getValue("inDate")));
        setText("outGR", getValue("inGR"));

        setText("outConsignor", getValue("inConsignor"));
        setText("outConsignorAddr", getValue("inConsignorAddr"));
        setText("outConsignorGST", getValue("inConsignorGST"));

        setText("outConsignee", getValue("inConsignee"));
        setText("outConsigneeAddr", getValue("inConsigneeAddr"));
        setText("outConsigneeGST", getValue("inConsigneeGST"));

        setText("outPkg", getValue("inPkg"));
        setText("outNature", getValue("inNature"));

        setText("outChargeWeight", getValue("inChargeWeight"));
        setText("outTbb", getValue("inTbb"));
        setText("outSCharge", getValue("inSCharge"));
        setText("outStChargeRs", getValue("inStChargeRs"));
        setText("outStChargeP", getValue("inStChargeP"));

        setText("outValue", getValue("inValue"));
        setText("outInvoice", getValue("inInvoice"));
        setText("outEway", getValue("inEway"));
        setText("outDeliveryAt", getValue("inDeliveryAt"));

        updateGST("gstConsignor", "outGstConsignor");
        updateGST("gstConsignee", "outGstConsignee");
        updateGST("gstTransporter", "outGstTransporter");

        // Refit after text changes without changing the user's selected size.
        requestAnimationFrame(() => {
            Object.keys(fieldMap).forEach(applyFieldStyle);
        });
    }


    function updateGST(inputId, outputId) {
        const input = $(inputId);
        const output = $(outputId);

        if (!input || !output) return;

        output.textContent = input.checked ? "✓" : "";
    }


    /* =====================================================
       LIVE INPUT EVENTS
    ===================================================== */

    document
        .querySelectorAll(".input-panel input, .input-panel textarea")
        .forEach((input) => {

            if (input.type === "checkbox" || input.type === "color") return;

            input.addEventListener("input", updateBilty);
            input.addEventListener("change", updateBilty);
        });

    document
        .querySelectorAll(".gst-options input")
        .forEach((input) => {
            input.addEventListener("change", updateBilty);
        });


   /* =====================================================
   PDF NAME
===================================================== */

function getPDFFileName() {
    let name = getValue("inPdfName").trim();

    if (!name) {
        const gr = getValue("inGR").trim();
        name = gr || "Bilty";
    }

    if (!name.toLowerCase().endsWith(".pdf")) {
        name += ".pdf";
    }

    return name;
}

/* =====================================================
   AUTO PDF NAME FROM G.R. NO.
===================================================== */

let pdfNameManuallyChanged = false;

const pdfNameInput = document.getElementById("inPdfName");
const grInput = document.getElementById("inGR");

if (pdfNameInput && grInput) {

    // User manually changes the PDF name
    pdfNameInput.addEventListener("input", function () {
        pdfNameManuallyChanged = true;
    });

    // G.R. No. changes
    grInput.addEventListener("input", function () {

        // Only auto-update if user has not manually changed the name
        if (!pdfNameManuallyChanged) {
            pdfNameInput.value = grInput.value.trim();
        }
    });

    // Initial value
    if (!pdfNameInput.value.trim() && grInput.value.trim()) {
        pdfNameInput.value = grInput.value.trim();
    }
}


    /* =====================================================
       CREATE PDF - A4 LANDSCAPE
    ===================================================== */

    async function createPDF() {
        const bilty = $("biltyPage");

        if (!bilty) {
            throw new Error("Bilty page not found.");
        }

        const canvas = await html2canvas(bilty, {
            scale: 3,
            backgroundColor: "#ffffff",
            useCORS: true,
            allowTaint: false,
            logging: false,
            width: 842,
            height: 595
        });

        const { jsPDF } = window.jspdf;

        const pdf = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4",
            compress: true
        });

        pdf.addImage(
            canvas.toDataURL("image/png"),
            "PNG",
            0,
            0,
            297,
            210,
            undefined,
            "FAST"
        );

        return pdf;
    }


  /* =====================================================
   GENERATE PDF
===================================================== */

$("btnGenerate").addEventListener("click", async () => {

    const button = $("btnGenerate");

    try {

        button.disabled = true;
        button.textContent = "Generating...";

        const pdf = await createPDF();

        pdf.save(getPDFFileName());

        try {
            saveBiltyToGoogleSheets("PDF");
        } catch (error) {
            console.error("Google Sheets save failed:", error);
        }

    } catch (error) {

        console.error(error);
        alert("Unable to generate PDF.");

    } finally {

        button.disabled = false;
        button.textContent = "Generate PDF";

    }

});


/* =====================================================
   PRINT
===================================================== */

$("btnPrint").addEventListener("click", () => {

    try {
        saveBiltyToGoogleSheets("PRINT");
    } catch (error) {
        console.error("Google Sheets save failed:", error);
    }

    window.print();

});


/* =====================================================
   SHARE
===================================================== */

$("btnShare").addEventListener("click", async () => {

    const button = $("btnShare");

    try {

        button.disabled = true;
        button.textContent = "Preparing...";

        const pdf = await createPDF();
        const blob = pdf.output("blob");

        const file = new File(
            [blob],
            getPDFFileName(),
            { type: "application/pdf" }
        );

        try {
            saveBiltyToGoogleSheets("SHARE");
        } catch (error) {
            console.error("Google Sheets save failed:", error);
        }

        if (
            navigator.share &&
            navigator.canShare &&
            navigator.canShare({ files: [file] })
        ) {

            await navigator.share({
                title: getPDFFileName().replace(/\.pdf$/i, ""),
                files: [file]
            });

        } else {

            pdf.save(getPDFFileName());

            alert(
                "Sharing is not supported by this browser. PDF downloaded instead."
            );

        }

    } catch (error) {

        if (error.name !== "AbortError") {
            console.error(error);
            alert("Unable to share the bilty.");
        }

    } finally {

        button.disabled = false;
        button.textContent = "Share";

    }

});


    /* =====================================================
       RESET
    ===================================================== */

    $("btnReset").addEventListener("click", () => {

        if (!confirm("Are you sure you want to clear all bilty details?")) {
            return;
        }

        document
            .querySelectorAll(".input-panel input, .input-panel textarea")
            .forEach((input) => {

                if (input.type === "checkbox") {
                    input.checked = false;
                } else if (input.id === "inPdfName") {
                    input.value = "CTI Bilty";
                } else {
                    input.value = "";
                }
            });

        document
            .querySelectorAll(".input-box[data-field]")
            .forEach((box) => {
                const fieldId = box.dataset.field;
                const defaults = fieldStyle[fieldId] || {
                    size: 15,
                    color: "#000000"
                };

                const select = box.querySelector(".field-tools select");
                const color = box.querySelector('input[type="color"]');
                const bold = box.querySelector(".bold-btn");

                if (select) select.value = String(defaults.size);
                if (color) color.value = defaults.color;
                if (bold) bold.classList.remove("active");

                applyFieldStyle(fieldId);
            });

        updateBilty();
    });


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    updateBilty();
});
