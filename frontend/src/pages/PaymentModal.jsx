import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Typography,
  Box,
  FormControlLabel as MuiFormControlLabel,
} from '@mui/material';
import { billOrder, fetchCountries, fetchRecipients, getCertifGoodsInfo, getCertifTranspMode, getCustAccountInfo, handleSendDocuments, setInvoiceHeader, setOrderFiles } from '../services/apiServices'; // API service functions
import { useSelector } from 'react-redux';
import { generatePDF } from '../components/orders/GeneratePDF';
import { Snackbar, Alert } from '@mui/material';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';


function PaymentModal({ open, onClose, onSubmit, order }) {


  // ─── Helper pour tamponner “COPIE” ─────────────────────────
  async function stampCopy(blobPdf) {
    const arrayBuffer = await blobPdf.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    pages.forEach(page => {
      const { width, height } = page.getSize();
      page.drawText('COPIE', {
        x: width / 2 - 100,
        y: height - 40,
        size: 48,
        font,
        color: rgb(0, 0, 1),
      });
    });

    const stampedBytes = await pdfDoc.save();
    return new Blob([stampedBytes], { type: 'application/pdf' });
  }

  // Default invoice date: today's date (YYYY-MM-DD)
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoiceNumber, setInvoiceNumber] = useState('');

  // Après vos useState existants
  const [step, setStep] = useState(0); // 0 = rien, 1 = facture, 2 = PDF, 3 = envoi, 4 = modal succès




  // Calculate Montant HT: unit_price_ord_certif_ori + (copies * unit_price_copies_ord_certif_ori)
  const unitPriceCertif = order?.unit_price_ord_certif_ori ? parseFloat(order.unit_price_ord_certif_ori) : 8500;
  const unitPriceCopies = order?.unit_price_copies_ord_certif_ori ? parseFloat(order.unit_price_copies_ord_certif_ori) : 2500;
  const copies = order?.copy_count_ori ? parseFloat(order.copy_count_ori) : 1;
  const computedMontantHT = (unitPriceCertif + copies * unitPriceCopies).toFixed(2);

  // Tax rate constant (e.g. 10% in this example)
  const rate_tax = 0.10;
  // Compute default Taxe as rate_tax * Montant HT
  const computedMontantTaxe = (parseFloat(computedMontantHT) * rate_tax).toFixed(2);

  // Local state for modifiable Montant HT and Taxe
  const [montantHT, setMontantHT] = useState(computedMontantHT);
  const [montantTaxe, setMontantTaxe] = useState(computedMontantTaxe);

  // Other payment-related state
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [customPaymentMethod, setCustomPaymentMethod] = useState('');

  // NEW: Payment Information field
  const [paymentInfo, setPaymentInfo] = useState('');

  // State to control the confirmation dialog
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  // Get the operator (user) info from Redux
  const user = useSelector((state) => state.auth.user);
  const operatorId = user?.id_login_user;

  // Update montantHT and montantTaxe when order or computed values change.
  useEffect(() => {
    setMontantHT(computedMontantHT);
    setMontantTaxe((parseFloat(computedMontantHT) * rate_tax).toFixed(2));
  }, [order, computedMontantHT, rate_tax]);

  // Helper function to combine address fields (client address)
  const getClientAddress = () => {
    if (!order) return 'Adresse client';
    const { address_1, address_2, address_3 } = order;
    return [address_1, address_2, address_3].filter(Boolean).join(', ') || 'Adresse client';
  };

  // Compute TOTAL as Montant HT + Taxe
  const totalAmount = (parseFloat(montantHT) + parseFloat(montantTaxe)).toFixed(2);

  // Open confirmation dialog on clicking "ENREGISTRER LE PAIEMENT"
  const handleOpenConfirmation = () => {
    if (!invoiceNumber.trim() || !paymentInfo.trim()) {
      // ex. afficher un snackbar ou toast d’alerte
      return;
    }
    setConfirmationOpen(true);
  };

  const [transpMode, settransportModes] = useState({});


  const [countries, setCountries] = useState([]);
  useEffect(() => {
    const getCountries = async () => {
      try {
        const fetchedCountries = await fetchCountries();
        setCountries(fetchedCountries);
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };
    getCountries();
  }, []);

  // When the user confirms ("Oui"), call billOrder and setInvoiceHeader.
  const handleConfirmPayment = async () => {
    try {
      const billResponse = await billOrder(order.id_order, operatorId);
      console.log('Order billed successfully:', billResponse);

      // Prepare the invoice header data.
      const invoiceData = {
        p_id_order: order?.id_order,
        p_invoice_number: invoiceNumber,
        p_amount_exVat: parseFloat(montantHT),
        p_amount_Vat: parseFloat(montantTaxe),
        p_idlogin_insert: operatorId,
        p_paymentDate: invoiceDate, // Must be a valid timestamp (YYYY-MM-DD)
        p_free_txt1: paymentMethod === 'Autre' ? customPaymentMethod : paymentMethod,
        p_free_txt2: paymentInfo, // Payment information field added here.
        p_idlogin_modify: operatorId,
      };

      const response = await setInvoiceHeader(invoiceData);
      console.log('Invoice header set successfully:', response);





      console.log('Génération de PDF pour la commande:', order);
      console.log("Transmode : ", transpMode);
      const originCountry = countries.find(c => c.id_country === order.id_country_origin)?.symbol_fr || '';
      const destinationCountry = countries.find(c => c.id_country === order.id_country_destination)?.symbol_fr || '';
      const portLoading = countries.find(c => c.id_country === order.id_country_port_loading)?.symbol_fr || '';
      const portDischarge = countries.find(c => c.id_country === order.id_country_port_discharge)?.symbol_fr || '';
      const transpResponse = await getCertifTranspMode({
        idListCT: null,
        idListCO: order.id_ord_certif_ori ? order.id_ord_certif_ori.toString() : null,
        isActiveOT: 'true',
        isActiveTM: 'true',
        idListOrder: null,
        idListOrderStatus: null,
      });
      let transportModesObj = {};
      if (transpResponse && transpResponse.data) {
        transpResponse.data.forEach((mode) => {
          transportModesObj[mode.symbol_fr.toLowerCase()] = true;
        });
      }
      console.log("transpResponse ", transportModesObj);
      const custAccountInfo = await getCustAccountInfo(order.id_cust_account);
      console.log("custAccountInfo ", custAccountInfo);
      const exporterCountry = countries.find(c => c.id_country === custAccountInfo.data[0].id_country)?.symbol_fr || '';
      console.log("exporterCountry ", exporterCountry);
      const certifGoods = await getCertifGoodsInfo(order.id_ord_certif_ori);
      console.log("certifGoods =>", certifGoods);
      const recipientInfoResponse = await fetchRecipients({
        idListR: order.id_recipient_account ? order.id_recipient_account.toString() : null,
      });
      const recipient = (recipientInfoResponse.data && recipientInfoResponse.data.length > 0)
        ? recipientInfoResponse.data[0]
        : {};
      console.log("Recipient info:", recipient);
      const formData = {
        transportModes: transportModesObj,
        merchandises: certifGoods.data || [],
        exporterName: order.cust_name || '',
        exporterAddress: custAccountInfo.data[0].full_address,
        exporterCountry: exporterCountry || '',
        originCountry,
        destinationCountry,
        portLoading,
        portDischarge,
        recipientName: recipient.recipient_name || '',
        recipientAddress: [recipient.address_1, recipient.address_2, recipient.address_3].filter(Boolean).join(', '),
        recipientCountry: recipient.country_symbol_fr_recipient,
        DateValidation: order.date_validation_ori,
        Certifid: order.id_ord_certif_ori
      };
      const pdfBlob = await generatePDF(formData);
      const pdfFile = new File(
        [pdfBlob],
        `certificat_${String(order.id_ord_certif_ori).padStart(8, '0')}.pdf`,
        { type: 'application/pdf' }
      );
      const orderFileData = {
        uploadType: 'commandes',
        p_id_order: order.id_order,
        p_idfiles_repo_typeof: 1000,
        p_file_origin_name: `certificat_${String(order.id_ord_certif_ori).padStart(8, '0')}.pdf`,
        p_typeof_order: 1,
        p_idlogin_insert: operatorId,
        file: pdfFile,
      };
      await setOrderFiles(orderFileData);

      // ─── Génération et upload d’UNE COPIE si demandé ───────
      console.log("ORDER => ", order);
      const copies = order.copy_count_ori ?? 0;
      if (copies > 0) {
        console.log('Création d’une COPIE tamponnée');
        const copyBlob = await stampCopy(pdfBlob);
        const copyName = `certificat_${String(order.id_ord_certif_ori).padStart(8, '0')}_COPIE.pdf`;
        await setOrderFiles({
          uploadType: 'commandes',
          p_id_order: order.id_order,
          p_idfiles_repo_typeof: 1001,        // COPIE
          p_file_origin_name: copyName,
          p_typeof_order: 1,
          p_idlogin_insert: operatorId,
          file: new File([copyBlob], copyName, { type: 'application/pdf' }),
        });
        console.log('Copie uploadée :', copyName);
      }



      await handleSendDocuments(order);
      setStep(1);

      console.log("PDF generated and order file saved successfully.");



      setConfirmationOpen(false);

      // Optionally, invoke parent's onSubmit callback if provided.

    } catch (error) {
      console.error('Erreur lors de la facturation de la commande:', error);
      // Optionally, display an error notification to the user.
    }
  };

  // Cancel confirmation dialog
  const handleCancelConfirmation = () => {
    setConfirmationOpen(false);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        {/* Dialog Title */}
        <DialogTitle>
          <Typography variant="h6" component="div">
            PAIEMENT DE LA COMMANDE N°{' '}
            <span style={{ color: 'goldenrod' }}>
              {order?.id_order?.toString().padStart(6, '0')}
            </span>{' '}
            de {order?.orderYear || '2025'}
          </Typography>
        </DialogTitle>

        {/* Dialog Content */}
        <DialogContent dividers>
          {/* Client Information */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {order?.cust_name || 'Nom Client'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {getClientAddress()}
            </Typography>
            {order?.country_symbol_fr && (
              <Typography variant="body2" color="text.secondary">
                {order.country_symbol_fr}
              </Typography>
            )}
          </Box>

          {/* Form Fields */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              type="date"
              label="Date de paiement"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
            />
            <TextField
              label="N° Facture"
              required
              fullWidth
              value={invoiceNumber}
              onChange={e => setInvoiceNumber(e.target.value)}
              error={!invoiceNumber.trim()}
              helperText={!invoiceNumber.trim() ? "Le numéro de facture est requis" : ""}
            />
          </Box>

          {/* Montant HT (modifiable) */}
          <TextField
            label="Montant HT"
            fullWidth
            value={montantHT}
            onChange={(e) => setMontantHT(e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* Taxe (modifiable) */}
          <TextField
            label="Taxe"
            fullWidth
            value={montantTaxe}
            onChange={(e) => setMontantTaxe(e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* Payment Method */}
          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <FormLabel component="legend">Règlement de la facture</FormLabel>
            <RadioGroup
              row
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <FormControlLabel value="Cash" control={<Radio />} label="Cash" />
              <FormControlLabel value="Chèque" control={<Radio />} label="Chèque" />
              <FormControlLabel value="Virement" control={<Radio />} label="Virement" />
              <FormControlLabel value="Autre" control={<Radio />} label="Autre" />
            </RadioGroup>
            {paymentMethod === 'Autre' && (
              <TextField
                label="Précisez le moyen de paiement"
                fullWidth
                value={customPaymentMethod}
                onChange={(e) => setCustomPaymentMethod(e.target.value)}
                sx={{ mt: 1 }}
              />
            )}
          </FormControl>

          {/* NEW: Payment Information Input */}
          <TextField
            label="Informations concernant le paiement"
            required
            fullWidth
            value={paymentInfo}
            onChange={e => setPaymentInfo(e.target.value)}
            error={!paymentInfo.trim()}
            helperText={!paymentInfo.trim() ? "Veuillez préciser les informations de paiement" : ""}
          />



        </DialogContent>

        {/* Action Buttons */}
        <DialogActions>
          <Button variant="contained" color="error" onClick={onClose}>
            FERMER
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleOpenConfirmation}
            disabled={!invoiceNumber.trim() || !paymentInfo.trim()}
          >
            ENREGISTRER LE PAIEMENT
          </Button>

        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmationOpen} onClose={handleCancelConfirmation} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6">Confirmer le paiement</Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Typography>
            Voulez-vous confirmer que le paiement suivant soit enregistré ?
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography>
              <strong>Montant HT:</strong> {montantHT} €
            </Typography>
            <Typography>
              <strong>TVA:</strong> {montantTaxe} €
            </Typography>
            <Typography>
              <strong>TOTAL:</strong> {totalAmount} €
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={handleCancelConfirmation} color="error">
            Non
          </Button>
          <Button variant="contained" onClick={handleConfirmPayment} color="success">
            Oui
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbars de feedback utilisateur */}
      {/* Snackbars séquentielles */}
      <Snackbar
        open={step === 1}
        autoHideDuration={2000}
        onClose={() => setStep(2)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{ bottom: '8px !important' }}
      >
        <Alert severity="success" variant="filled">
          Paiement enregistré avec succès !
        </Alert>
      </Snackbar>

      <Snackbar
        open={step === 2}
        autoHideDuration={2000}
        onClose={() => setStep(3)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{ bottom: '64px !important' }}
      >
        <Alert severity="info" variant="filled">
          PDF généré et enregistré.
        </Alert>
      </Snackbar>

      <Snackbar
        open={step === 3}
        autoHideDuration={2000}
        onClose={() => setStep(4)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{ bottom: '120px !important' }}
      >
        <Alert severity="success" variant="filled">
          Documents envoyés avec succès !
        </Alert>
      </Snackbar>


      <Dialog
        open={step === 4}
        onClose={() => setStep(0)}   // ← on referme en remettant step à 0
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Tout est OK ! 🎉</DialogTitle>
        <DialogContent>
          <Typography>
            Le paiement, la génération du PDF et l’envoi des documents ont tous réussi.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setStep(0);
            onSubmit && onSubmit(/* éventuellement response */);
            onClose();
          }}
            variant="contained"
            color="primary"
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>


    </>
  );
}

export default PaymentModal;