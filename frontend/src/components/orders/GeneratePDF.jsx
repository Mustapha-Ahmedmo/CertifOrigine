// GeneratePDF.jsx
import { PDFDocument, rgb } from 'pdf-lib';
import saveAs from 'file-saver';

// Fonction pour obtenir la date actuelle au format "Djiboutji, le ..."
const getCurrentDate = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Mois de 0 à 11, donc on ajoute 1
  const year = today.getFullYear();
  return `${day}/${month}/${year}`;
};

export const generatePDF = async (formData) => {
  // Charger ton modèle de PDF
  const existingPdfBytes = await fetch('certificat.pdf').then(res => res.arrayBuffer());

  // Charger le PDF avec PDF-Lib
  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  // Accéder aux champs du formulaire dans le PDF
  const form = pdfDoc.getForm();

  console.log(formData);

  // Ajouter du texte personnalisé (par exemple)
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  const selectedTransportModes = Object.keys(formData.transportModes)
    .filter(mode => formData.transportModes[mode])
    .map(mode => mode.toUpperCase())  // Convertir en majuscules
    .join(', ');

  // Ajouter les modes de transport en bas à gauche du PDF
  firstPage.drawText(`${selectedTransportModes}`, {
    x: 250,  // Coordonnée x au hasard
    y: 560,  // Coordonnée y au hasard (en bas à gauche)
    size: 26,
    color: rgb(0, 0, 0),  // Noir
  });

  // Ajouter le tableau des marchandises (désignation, nature de la marchandise, poids)
  let yPosition = 1000;  // Position Y de départ pour les marchandises
  const xDesignation = 150;  // Position X pour "Désignation"
  const xNature = 400;      // Position X pour "Nature de la marchandise"
  const xWeight = 1000;      // Position X pour "Poids"

  // Ajouter chaque marchandise à une nouvelle ligne
  formData.merchandises.forEach((merchandise, index) => {
    const currentY = yPosition + index * 50;  // Calculer la position Y pour chaque ligne
    firstPage.drawText(merchandise.designation.toUpperCase(), { x: xDesignation, y: currentY, size: 26, color: rgb(0, 0, 0) });
    firstPage.drawText(`${formData.exporterName}`, { x: xDesignation, y: currentY - 50, size: 26, color: rgb(0, 0, 0) });
    firstPage.drawText(`${formData.exporterAddress}, ${formData.exporterCity}`, { x: xDesignation, y: currentY - 70, size: 26, color: rgb(0, 0, 0) });

    firstPage.drawText(merchandise.nature?.toUpperCase() || 'N/A', { x: xNature, y: currentY, size: 26, color: rgb(0, 0, 0) });
    firstPage.drawText(`${merchandise.quantity} KG`, { x: xWeight, y: currentY, size: 26, color: rgb(0, 0, 0) });
  });

  // Ajouter la date en bas à droite du PDF
  const dateText = getCurrentDate();
  firstPage.drawText(dateText, {
    x: 900,  // Coordonnée x en bas à droite (ajuster selon les dimensions de votre PDF)
    y: 430,   // Coordonnée y pour placer le texte proche du bas
    size: 26,
    color: rgb(0, 0, 0),  // Noir
  });

  // Sauvegarder le PDF modifié
  const pdfBytes = await pdfDoc.save();

  // Télécharger le PDF généré
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  saveAs(blob, 'generated_order.pdf');
};