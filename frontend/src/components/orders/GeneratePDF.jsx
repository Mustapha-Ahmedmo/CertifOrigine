// GeneratePDF.jsx
import { PDFDocument, rgb } from 'pdf-lib';
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
 *   Expected properties:
 *     - transportModes: { road: true, sea: false, air: true, ... }
 *     - merchandises: Array of merchandise objects with properties:
 *         { designation, nature, quantity }
 *     - exporterName, exporterAddress, exporterCity, etc.
 *     - originCountry, destinationCountry, portLoading, portDischarge (new fields)
 */
export const generatePDF = async (formData) => {
  try {
    console.log("GENERATING PDF with formData:", formData);

    // Check that formData is provided
    if (!formData) {
      throw new Error("No formData provided.");
    }

    // Fetch the PDF template from the public folder.
    const response = await fetch('/certificat.pdf');
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF template: ${response.statusText}`);
    }
    const existingPdfBytes = await response.arrayBuffer();

    // Load the PDF document
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    if (!pages || pages.length === 0) {
      throw new Error("The PDF document contains no pages.");
    }
    const firstPage = pages[0];

    // --- Print exporter information at the top left ---
    if (formData.exporterName) {
      firstPage.drawText(`${formData.exporterName}`, {
        x: 130,
        y: 760,
        size: 12,
        color: rgb(0, 0, 0),
      });
    }
    if (formData.exporterAddress) {
      firstPage.drawText(`${formData.exporterAddress}`, {
        x: 130,
        y: 740,
        size: 12,
        color: rgb(0, 0, 0),
      });
    }
    if (formData.exporterCountry) {
      firstPage.drawText(`${formData.exporterCountry}`, {
        x: 130,
        y: 720,
        size: 12,
        color: rgb(0, 0, 0),
      });
    }


    // --- Print Recipient Information ---
    let recipientY = 690; // Starting Y coordinate for recipient info
    let xRecipient = 130; // X position for recipient info
    if (formData.recipientName) {
      firstPage.drawText(`${formData.recipientName}`, {
        x: xRecipient,
        y: recipientY,
        size: 12,
        color: rgb(0, 0, 0),
      });
      recipientY -= 20;
    }
    if (formData.recipientAddress) {
      firstPage.drawText(`${formData.recipientAddress}`, {
        x: xRecipient,
        y: recipientY,
        size: 12,
        color: rgb(0, 0, 0),
      });
      recipientY -= 20;
    }
    if (formData.recipientCountry) {
      firstPage.drawText(`${formData.recipientCountry}`, {
        x: xRecipient,
        y: recipientY,
        size: 12,
        color: rgb(0, 0, 0),
      });
    }


    // Process transport modes
    const transportModes = formData.transportModes || {};
    const selectedTransportModes = Object.keys(transportModes)
      .filter(mode => transportModes[mode])
      .map(mode => mode.charAt(0).toUpperCase() + mode.slice(1).toLowerCase())
      .join(', ');

    // --- Draw Merchandise Details ---
    const merchandises = Array.isArray(formData.merchandises) ? formData.merchandises : [];
    if (merchandises.length === 0) {
      console.warn("No merchandise data provided.");
    }
    let yPosition = 470;
    const xDesignation = 250; // X position for "Désignation"
    const xNature = 50;      // X position for "Nature"
    const xWeight = 490;     // X position for "Quantité / Poids"

    merchandises.forEach((merchandise, index) => {
      if (!merchandise) {
        console.warn(`Merchandise at index ${index} is undefined.`);
        return;
      }
      const currentY = yPosition - index * 20;  // Adjust spacing between rows

      // Check if the merchandise appears to be a certif goods object
      const isCertifGoods = merchandise.good_description !== undefined;
      const designation = isCertifGoods
        ? merchandise.good_description.toUpperCase()
        : (merchandise.designation ? merchandise.designation.toUpperCase() : 'N/A');
      const quantity = isCertifGoods
        ? (merchandise.weight_qty ? `${merchandise.weight_qty} ${merchandise.symbol_fr || ''}` : '')
        : (merchandise.quantity ? `${merchandise.quantity} KG` : '');
      const reference = isCertifGoods
        ? (merchandise.good_references || '')
        : (merchandise.nature ? merchandise.nature.toUpperCase() : 'N/A');

      firstPage.drawText(designation, {
        x: xDesignation,
        y: currentY,
        size: 12,
        color: rgb(0, 0, 0)
      });
      firstPage.drawText(reference, {
        x: xNature,
        y: currentY,
        size: 12,
        color: rgb(0, 0, 0)
      });
      firstPage.drawText(quantity, {
        x: xWeight,
        y: currentY,
        size: 12,
        color: rgb(0, 0, 0)
      });
    });


    // --- New: Draw country and port information ---
    // We'll draw these fields near the bottom-left of the page.
    let countryY = 560; // Starting Y coordinate (adjust as needed)
    let xCountry = 450; // X position for country info

    if (formData.originCountry) {
      firstPage.drawText(`${formData.originCountry}`, {
        x: xCountry,
        y: countryY,
        size: 12,
        color: rgb(0, 0, 0),
      });
      countryY -= 40;
    }
    if (formData.destinationCountry) {
      firstPage.drawText(`${formData.destinationCountry}`, {
        x: xCountry,
        y: countryY,
        size: 12,
        color: rgb(0, 0, 0),
      });
      countryY -= 30;
    }

    countryY = 600; // Starting Y coordinate (adjust as needed)
    xCountry = 150; // X position for country info

    if (formData.portLoading) {
      firstPage.drawText(`${formData.portLoading}`, {
        x: xCountry,
        y: countryY,
        size: 12,
        color: rgb(0, 0, 0),
      });
      countryY -= 30;
    }
    if (formData.portDischarge) {
      firstPage.drawText(`${formData.portDischarge}`, {
        x: xCountry,
        y: countryY,
        size: 12,
        color: rgb(0, 0, 0),
      });
      countryY -= 35; // Uncomment if you need additional spacing
    }

    // Draw the transport mode(s) under port de déchargement.
    if (selectedTransportModes) {
      firstPage.drawText(`${selectedTransportModes}`, {
        x: xCountry,
        y: countryY,
        size: 12,
        color: rgb(0, 0, 0),
      });
    } else {
      console.warn("No transport modes selected for PDF.");
    }

    // --- End of new country info ---

    // Draw the current date in the bottom-right of the page.

    firstPage.drawText(formatDate(formData.DateValidation), {
      x: 355,
      y: 630,
      size: 12,
      color: rgb(0, 0, 0),
    });

    firstPage.drawRectangle({
      x: 487,
      y: 630,
      width: 40,   // Adjust width based on your text length
      height: 10,  // Adjust height based on your font size
      color: rgb(1, 1, 1), // White color
    });
    

    const formattedId = String(formData.Certifid).padStart(8, '0');
    firstPage.drawText(formattedId, {
      x: 490,
      y: 630,
      size: 12,
      color: rgb(0, 0, 0),
    });

    // Save the modified PDF document.
    const pdfBytes = await pdfDoc.save();

    // Create a Blob from the PDF bytes and trigger a download.
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
   // saveAs(blob, 'generated_order.pdf');
    return blob;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};