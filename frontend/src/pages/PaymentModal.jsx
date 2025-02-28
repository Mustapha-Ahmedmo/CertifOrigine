// PaymentModal.jsx
import React, { useState } from 'react';
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
} from '@mui/material';

function PaymentModal({ open, onClose, onSubmit, order }) {
  // order peut contenir : id_order, orderYear, cust_name, etc.

  // États locaux pour les champs du formulaire
  const [invoiceDate, setInvoiceDate] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  // Le montant HT sera calculé via une logique fournie (exemple ici)
  const computedMontantHT = order?.calculatedMontantHT || '1234.56';
  const [montantTaxe, setMontantTaxe] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [customPaymentMethod, setCustomPaymentMethod] = useState('');
  const [generateCertif, setGenerateCertif] = useState(false);

  // Fonction de soumission (quand on clique sur "ENREGISTRER LE PAIEMENT")
  const handleSubmit = () => {
    const finalPaymentMethod =
      paymentMethod === 'Autre' ? customPaymentMethod : paymentMethod;

    const paymentData = {
      invoiceDate,
      invoiceNumber,
      montantHT: computedMontantHT,
      montantTaxe,
      paymentMethod: finalPaymentMethod,
      generateCertif,
      orderId: order?.id_order,
    };
    onSubmit(paymentData);  // callback vers le parent
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {/* Titre de la modale */}
      <DialogTitle>
        <Typography variant="h6" component="div">
          PAIEMENT DE LA COMMANDE N°{' '}
          <span style={{ color: 'goldenrod' }}>
            {order?.id_order?.toString().padStart(6, '0')}
          </span>{' '}
          de {order?.orderYear || '2025'}
        </Typography>
      </DialogTitle>

      {/* Contenu de la modale */}
      <DialogContent dividers>
        {/* Informations sur le client */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {order?.cust_name || 'Nom Client'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {order?.cust_address || 'Adresse client'}
          </Typography>
        </Box>

        {/* Champs du formulaire */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            type="date"
            label="Date de facture"
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

        {/* Champ affichant le Montant HT en lecture seule */}
        <TextField
          label="Montant HT"
          fullWidth
          value={computedMontantHT}
          disabled
          sx={{ mb: 2 }}
        />

        {/* Champ pour Taxe */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Taxe"
            fullWidth
            value={montantTaxe}
            onChange={(e) => setMontantTaxe(e.target.value)}
          />
        </Box>

        {/* Règlement de la facture avec option "Autre" */}
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

        {/* Le champ "Information concernant le paiement" a été supprimé */}

        {/* Case à cocher pour générer le certificat */}
        <FormControlLabel
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

      {/* Boutons d'action */}
      <DialogActions>
        <Button variant="contained" color="error" onClick={onClose}>
          FERMER
        </Button>
        <Button variant="contained" color="success" onClick={handleSubmit}>
          ENREGISTRER LE PAIEMENT
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PaymentModal;
