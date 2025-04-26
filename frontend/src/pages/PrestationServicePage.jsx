// src/pages/PrestationServicesPage.jsx
import React from 'react';
import {
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper
} from '@mui/material';


const invoiceBrackets = [
  { from: '01 FD', to: '1 000 000 FD', fee: '5 000 FD' },
  { from: '1 000 001 FD', to: '3 000 000 FD', fee: '6 000 FD' },
  { from: '3 000 001 FD', to: '5 000 000 FD', fee: '7 000 FD' },
  { from: '5 000 001 FD', to: '10 000 000 FD', fee: '8 000 FD' },
  { from: '10 000 001 FD', to: '20 000 000 FD', fee: '9 000 FD' },
  { from: '20 000 001 FD', to: '30 000 000 FD', fee: '10 000 FD' },
  { from: '30 000 001 FD', to: '40 000 000 FD', fee: '11 000 FD' },
  { from: '40 000 001 FD', to: '50 000 000 FD', fee: '12 000 FD' },
  { from: '50 000 001 FD', to: '60 000 000 FD', fee: '13 000 FD' },
  { from: '60 000 001 FD', to: '100 000 000 FD', fee: '14 000 FD' },
  { from: 'Plus de 100 000 001 FD', fee: '20 000 FD' },
];

const PrestationServicesPage = () => (

  
  <Box
    sx={{
      maxWidth: 800,
      mx: 'auto',
      p: 4,
    }}
  >
    {/* Titre rouge */}
    <Box sx={{ textAlign: 'center', my: 3 }}>
        <Typography variant="h5" sx={{ color: 'red', fontWeight: 'bold' }}>
          Données en attente de la Chambre de Commerce
        </Typography>
      </Box>
    <Typography variant="h4" align="center" gutterBottom>
      CHAMBRE DE COMMERCE DE DJIBOUTI
    </Typography>

    <Typography variant="h5" align="center" gutterBottom>
      ACTUELLES TARIFICATIONS
    </Typography>

    <Typography variant="h6" gutterBottom>
      1. Pour les certificats d'origine
    </Typography>
    <Typography variant="body2" gutterBottom>
      • 7 500 FD par original + 1 000 timbre = 8 500 FD  
      <br />
      • 2 500 FD par copie
    </Typography>

    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
      2. Packing - List
    </Typography>
    <Typography variant="body2" gutterBottom>
      • 5000 FD par original
      <br />
      • 2500 FD par copie
    </Typography>

    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
      3. Facture commerciale (Commercial Invoice)
    </Typography>
    <TableContainer component={Paper} variant="outlined" sx={{ my: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Montant de la facture (FD)</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {invoiceBrackets.map((row, idx) => (
            <TableRow key={idx}>
              <TableCell>
                {row.from} → {row.to === '∞' ? 'Plus de ' + row.from : row.to}{row.to !== '∞' && ' FD'}
              </TableCell>
              <TableCell>{row.fee}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={2}>
              <em>
                N.B. : Pour toute facture inférieure à sa valeur réelle, le frais de certification est de 20 000 FD forfaitaire
                <br />
                • Copie : 2500 FD
              </em>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>

    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
      4. Contrat
    </Typography>
    <Typography variant="body2" gutterBottom>
      • 20 000 FD par original 
      <br />
      • 10 000 FD par copie 
    </Typography>

    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
      5. Autres documents (Way Bill)
    </Typography>
    <Typography variant="body2" gutterBottom>
      • 10 000 FD par original  
      <br />
      • 5 000 FD par copie
    </Typography>

    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
      6. Vente de documents
    </Typography>
    <Typography variant="body2" gutterBottom>
      • 500 FD par Certificat d'origine vierge 
    </Typography>

    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
      7. Attestation de notoriété
    </Typography>
    <Typography variant="body2" gutterBottom>
      • Patente inférieur ou égale à 35000 FD  &gt; 5 000FD
      <br />
      • Patente supérieur à 35 000 FD &gt; 10 000 FD
    </Typography>

    <Typography variant="body2" align="right" sx={{ mt: 4 }}>
      Fait à Djibouti, le 28 Avril 2021  
      Mme ZABRA OMAR AHMED  
      Directrice du Département Information des Études Économiques
    </Typography>
  </Box>
);

export default PrestationServicesPage;
