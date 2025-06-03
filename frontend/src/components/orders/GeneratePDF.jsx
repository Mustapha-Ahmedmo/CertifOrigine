// GeneratePDF.jsx
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'; // ajouté StandardFonts
import saveAs from 'file-saver';
import { formatDate } from '../../utils/dateUtils';

/**
 * Returns the current date formatted as "DD/MM/YYYY"
 */
const getCurrentDate = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = today.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Generates a customized PDF using a PDF template.
 *
 * @param {Object} formData - The data to be inserted into the PDF.
 */
export const generatePDF = async (formData) => {
  try {
    console.log("GENERATING PDF with formData:", formData);

    if (!formData) {
      throw new Error("No formData provided.");
    }

    // Fetch the PDF template
    const response = await fetch('/certificat.pdf');
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF template: ${response.statusText}`);
    }
    const existingPdfBytes = await response.arrayBuffer();

    // Load the document and embed the font
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const [firstPage] = pdfDoc.getPages();
    if (!firstPage) {
      throw new Error("The PDF document contains no pages.");
    }
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const baseSize = 10;    // taille de police réduite
    const lineStep = 18;    // espacement vertical

    // --- Expéditeur ---
    if (formData.exporterName) {
      firstPage.drawText(formData.exporterName, {
        x: 100, y: 763,
        size: baseSize, font, color: rgb(0,0,0)
      });
    }
    if (formData.exporterAddress) {
      firstPage.drawText(formData.exporterAddress, {
        x: 113, y: 746,
        size: baseSize, font, color: rgb(0,0,0)
      });
    }
    if (formData.exporterCountry) {
      firstPage.drawText(formData.exporterCountry, {
        x: 100, y: 725,
        size: baseSize, font, color: rgb(0,0,0)
      });
    }

    // --- Destinataire ---
    let recY = 685;
    if (formData.recipientName) {
      firstPage.drawText(formData.recipientName, {
        x: 110, y: recY,
        size: baseSize, font, color: rgb(0,0,0)
      });
      recY -= lineStep;
    }
    if (formData.recipientAddress) {
      firstPage.drawText(formData.recipientAddress, {
        x: 110, y: recY,
        size: baseSize, font, color: rgb(0,0,0)
      });
      recY -= lineStep;
    }
    if (formData.recipientCountry) {
      firstPage.drawText(formData.recipientCountry, {
        x: 110, y: recY,
        size: baseSize, font, color: rgb(0,0,0)
      });
    }

    // Process transport modes
    const transportModes = formData.transportModes || {};
    const selectedTransportModes = Object.keys(transportModes)
      .filter(m => transportModes[m])
      .map(m => m.charAt(0).toUpperCase() + m.slice(1).toLowerCase())
      .join(', ');

    // --- Marchandises ---
    const merchs = Array.isArray(formData.merchandises) ? formData.merchandises : [];
    const startY = 470;
    merchs.forEach((m, i) => {
      if (!m) return;
      const y = startY - i * lineStep;
      const isCert = m.good_description !== undefined;
      const des = (isCert ? m.good_description : m.designation || 'N/A').toUpperCase();
      const ref = (isCert ? m.good_references : m.nature || 'N/A').toUpperCase();
      const qty = isCert
        ? (m.weight_qty ? `${m.weight_qty} ${m.symbol_fr||''}` : '')
        : (m.quantity ? `${m.quantity} KG` : '');

      firstPage.drawText(des, {
        x: 250, y,
        size: baseSize, font, color: rgb(0,0,0)
      });
      firstPage.drawText(ref, {
        x: 50, y,
        size: baseSize, font, color: rgb(0,0,0)
      });
      firstPage.drawText(qty, {
        x: 490, y,
        size: baseSize, font, color: rgb(0,0,0)
      });
    });

    // --- Pays & Ports ---
const offsetX = 10;  // décale toute la section vers la droite
const offsetYOrigin = 10;  // remontée de 10 points pour le pays d’origine
const offsetYLoading = 10;

let cy = 560;
if (formData.originCountry) {
  firstPage.drawText(formData.originCountry, {
    // x initial 400 → +10 pour décaler à droite,
    // y initial cy (560) → +10 pour remonter
    x: 400 + offsetX,
    y: cy + offsetYOrigin,
    size: baseSize,
    font,
    color: rgb(0, 0, 0),
  });
  cy -= 35; // si vous voulez conserver l’espacement vertical après ce texte
}

if (formData.destinationCountry) {
  firstPage.drawText(formData.destinationCountry, {
    x: 420 + offsetX,    // 420 → 440
    y: cy,
    size: baseSize,
    font,
    color: rgb(0, 0, 0),
  });
}

let portY = 600;
if (formData.portLoading) {
  firstPage.drawText(formData.portLoading, {
    // x initial 100 → +10 pour décaler à droite,
    // y initial portY (600) → +10 pour remonter
    x: 100 + offsetX,
    y: portY + offsetYLoading,
    size: baseSize,
    font,
    color: rgb(0, 0, 0),
  });
  // On remet portY pour la suite en déduisant 30 (ou plus si besoin)
  portY = (portY + offsetYLoading) - 30;
}

if (formData.portDischarge) {
  // on décale portY de 10 points vers le bas avant d’écrire
  const adjustedY = portY - 10;

  firstPage.drawText(formData.portDischarge, {
    x: 110 + offsetX,    // 110 → 130
    y: adjustedY,
    size: baseSize,
    font,
    color: rgb(0, 0, 0),
  });

  // on met à jour portY pour la suite (modes de transport)
  portY = adjustedY - 30;
}

if (selectedTransportModes) {
  // on abaisse encore de 10 points pour les modes de transport
  portY -= 10;
  firstPage.drawText(selectedTransportModes, {
    x: 125 + offsetX,    // 125 → 145
    y: portY,
    size: baseSize,
    font,
    color: rgb(0, 0, 0),
  });
}

    

    // --- Date & Certificat ---
    firstPage.drawText(formatDate(formData.DateValidation), {
      x: 355, y: 630,
      size: baseSize, font, color: rgb(0,0,0)
    });
    firstPage.drawRectangle({
      x: 487, y: 630, width: 40, height: 10,
      color: rgb(1,1,1)
    });
    firstPage.drawText(String(formData.Certifid).padStart(8,'0'), {
      x: 490, y: 630,
      size: baseSize, font, color: rgb(0,0,0)
    });

    // Save & return
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });

  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};
