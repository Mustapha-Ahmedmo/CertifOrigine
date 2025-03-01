// GeneratePDF.jsx
import { PDFDocument, rgb } from 'pdf-lib';
import saveAs from 'file-saver';

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

    // Process transport modes
    const transportModes = formData.transportModes || {};
    const selectedTransportModes = Object.keys(transportModes)
      .filter(mode => transportModes[mode])
      .map(mode => mode.toUpperCase())
      .join(', ');
    if (selectedTransportModes) {
      firstPage.drawText(selectedTransportModes, {
        x: 250,
        y: 560,
        size: 26,
        color: rgb(0, 0, 0),
      });
    } else {
      console.warn("No transport modes selected.");
    }

    // Draw merchandise details if provided
    const merchandises = Array.isArray(formData.merchandises) ? formData.merchandises : [];
    if (merchandises.length === 0) {
      console.warn("No merchandise data provided.");
    }
    let yPosition = 1000;
    const xDesignation = 150; // X position for "Désignation"
    const xNature = 400;      // X position for "Nature de la marchandise"
    const xWeight = 1000;     // X position for "Poids"

    merchandises.forEach((merchandise, index) => {
      if (!merchandise || !merchandise.designation || !merchandise.quantity) {
        console.warn(`Merchandise at index ${index} is missing required fields.`);
        return;
      }
      const currentY = yPosition - index * 50;  // Adjust spacing between rows
      firstPage.drawText(merchandise.designation.toUpperCase(), { 
        x: xDesignation, 
        y: currentY, 
        size: 26, 
        color: rgb(0, 0, 0) 
      });
      // Optionally add exporter info if provided
      if (formData.exporterName) {
        firstPage.drawText(formData.exporterName, { 
          x: xDesignation, 
          y: currentY - 50, 
          size: 26, 
          color: rgb(0, 0, 0) 
        });
      }
      if (formData.exporterAddress && formData.exporterCity) {
        firstPage.drawText(`${formData.exporterAddress}, ${formData.exporterCity}`, { 
          x: xDesignation, 
          y: currentY - 70, 
          size: 26, 
          color: rgb(0, 0, 0) 
        });
      }
      firstPage.drawText(merchandise.nature ? merchandise.nature.toUpperCase() : 'N/A', { 
        x: xNature, 
        y: currentY, 
        size: 26, 
        color: rgb(0, 0, 0) 
      });
      firstPage.drawText(`${merchandise.quantity} KG`, { 
        x: xWeight, 
        y: currentY, 
        size: 26, 
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
      countryY -= 30;
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
      // countryY -= 30; // Uncomment if you need additional spacing
    }
    // --- End of new country info ---

    // Draw the current date in the bottom-right of the page.
    const dateText = getCurrentDate();
    firstPage.drawText(dateText, {
      x: 900,
      y: 430,
      size: 26,
      color: rgb(0, 0, 0),
    });

    // Save the modified PDF document.
    const pdfBytes = await pdfDoc.save();

    // Create a Blob from the PDF bytes and trigger a download.
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    saveAs(blob, 'generated_order.pdf');
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};