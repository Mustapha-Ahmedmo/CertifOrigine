// GeneratePDF.jsx
import { PDFDocument, rgb } from 'pdf-lib';
import saveAs from 'file-saver';

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
  firstPage.drawText('Order Summary', {
    x: 50,
    y: 750,
    size: 20,
    color: rgb(0, 0, 1),
  });

  // Sauvegarder le PDF modifié
  const pdfBytes = await pdfDoc.save();

  // Télécharger le PDF généré
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  saveAs(blob, 'generated_order.pdf');
};