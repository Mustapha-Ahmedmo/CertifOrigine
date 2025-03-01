// PaymentModal.jsx
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
import { billOrder, setInvoiceHeader } from '../services/apiServices'; // API service function for invoice header
import { useSelector } from 'react-redux';

function PaymentModal({ open, onClose, onSubmit, order }) {
  // order may contain fields such as id_order, orderYear, cust_name, copy_count_ori,
  // unit_price_ord_certif_ori, unit_price_copies_ord_certif_ori, address_1, address_2, address_3,
  // country_symbol_fr, etc.

  // Default invoice date: today's date (YYYY-MM-DD)
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoiceNumber, setInvoiceNumber] = useState('');

  // Calculate Montant HT: unit_price_ord_certif_ori + (copies * unit_price_copies_ord_certif_ori)
  const unitPriceCertif = order?.unit_price_ord_certif_ori ? parseFloat(order.unit_price_ord_certif_ori) : 10000;
  const unitPriceCopies = order?.unit_price_copies_ord_certif_ori ? parseFloat(order.unit_price_copies_ord_certif_ori) : 1000;
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
  const [generateCertif, setGenerateCertif] = useState(false);

  // State to control the confirmation dialog
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  // Get the operator (user) info from Redux (we use operatorId for both insert and modify)
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

  // When the user clicks "ENREGISTRER LE PAIEMENT", open the confirmation dialog.
  const handleOpenConfirmation = () => {
    setConfirmationOpen(true);
  };

  // When the user confirms ("Oui"), call setInvoiceHeader.
  const handleConfirmPayment = async () => {
    try {
      const billResponse = await billOrder(order.id_order, operatorId);
      console.log('Order billed successfully:', billResponse);

     
      // Prepare the invoice header data.
      // We include p_idlogin_modify (set here equal to operatorId) for the stored procedure.
      const invoiceData = {
        p_id_order: order?.id_order,
        p_invoice_number: invoiceNumber,
        p_amount_exVat: parseFloat(montantHT),
        p_amount_Vat: parseFloat(montantTaxe),
        p_idlogin_insert: operatorId,
        p_paymentDate: invoiceDate, // Should be in a valid timestamp format (YYYY-MM-DD)
        p_free_txt1: paymentMethod === 'Autre' ? customPaymentMethod : paymentMethod,
        p_free_txt2: "", // Optionally add additional info if needed
        p_idlogin_modify: operatorId,
      };

      const response = await setInvoiceHeader(invoiceData);
      console.log('Invoice header set successfully:', response);
      setConfirmationOpen(false);
      // Optionally, invoke parent's onSubmit callback if provided:
      if (onSubmit) onSubmit(response);
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
              fullWidth
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
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

          {/* Checkbox for generating certificate */}
          <MuiFormControlLabel
            control={
              <Checkbox
                checked={generateCertif}
                onChange={(e) => setGenerateCertif(e.target.checked)}
              />
            }
            label="Générer le certificat d'origine et les copies conformes"
            sx={{ mt: 2 }}
          />
        </DialogContent>

        {/* Action Buttons */}
        <DialogActions>
          <Button variant="contained" color="error" onClick={onClose}>
            FERMER
          </Button>
          <Button variant="contained" color="success" onClick={handleOpenConfirmation}>
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
    </>
  );
}

export default PaymentModal;