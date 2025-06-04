// components/OrderSummary.jsx
import React from 'react';
import { Box, Card, CardContent, Typography, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';

const OrderSummary = ({ values, countries, transportModes, documentsInfo }) => (
  <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
    <Typography variant="h5" align="center" fontWeight="bold" mb={2}>
      Récapitulatif de la commande
    </Typography>

    {/* 1/7 Demandeur */}
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight="bold" color="#C39408" mb={1}>
          1/7 Demandeur / Expéditeur
        </Typography>
        <Box display="flex" gap={2}>
          <Typography fontWeight={600}>Société :</Typography>
          <Typography>{values.exporterName}</Typography>
        </Box>
        <Box display="flex" gap={2} mt={1}>
          <Typography fontWeight={600}>Libellé :</Typography>
          <Typography>{values.orderLabel}</Typography>
        </Box>
      </CardContent>
    </Card>

    {/* 2/7 Destinataire */}
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight="bold" color="#C39408" mb={1}>
          2/7 Destinataire
        </Typography>
        <Box>
          <Typography><strong>Nom :</strong> {values.receiverName}</Typography>
          <Typography><strong>Adresse :</strong> {values.receiverAddress}</Typography>
          <Typography><strong>CP/Ville :</strong> {values.receiverPostalCode}, {values.receiverCity}</Typography>
          <Typography><strong>Pays :</strong> {values.receiverCountry}</Typography>
        </Box>
      </CardContent>
    </Card>

    {/* 3/7 Marchandises */}
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight="bold" color="#C39408" mb={2}>
          3/7 Description de la marchandise
        </Typography>
        {values.merchandises.length ? (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Désignation</TableCell>
                <TableCell>Réf. / HSCODE</TableCell>
                <TableCell>Doc. justif.</TableCell>
                <TableCell>Quantité</TableCell>
                <TableCell>Unité</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {values.merchandises.map((m, i) => (
                <TableRow key={i}>
                  <TableCell>{m.designation}</TableCell>
                  <TableCell>{m.boxReference}</TableCell>
                  <TableCell>{m.docReference}</TableCell>
                  <TableCell>{m.quantity}</TableCell>
                  <TableCell>{m.unit}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography>Aucune marchandise ajoutée.</Typography>
        )}
      </CardContent>
    </Card>

    {/* 4/7 Origine & Destination */}
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight="bold" color="#C39408" mb={1}>
          4/7 Origine & Destination
        </Typography>
        <Typography><strong>Pays d'origine :</strong> {values.goodsOrigin}</Typography>
        <Typography><strong>Pays de destination :</strong> {values.goodsDestination}</Typography>
      </CardContent>
    </Card>

    {/* 5/7 Transport */}
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight="bold" color="#C39408" mb={1}>
          5/7 Transport
        </Typography>
        <Typography><strong>Port chargement :</strong> {values.loadingPort}</Typography>
        <Typography><strong>Port déchargement :</strong> {values.dischargingPort}</Typography>
        <Typography>
          <strong>Modes :</strong>{' '}
          {Object.keys(values.transportModes)
            .filter((k) => values.transportModes[k])
            .map((k) => k.charAt(0).toUpperCase() + k.slice(1))
            .join(', ')}
        </Typography>
        <Typography><strong>Remarques :</strong> {values.transportRemarks}</Typography>
      </CardContent>
    </Card>

    {/* 6/7 Autres */}
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight="bold" color="#C39408" mb={1}>
          6/7 Copies & Remarques
        </Typography>
        <Typography><strong>Copies certifiées :</strong> {values.copies}</Typography>
        <Typography><strong>Remarques générales :</strong> {values.remarks}</Typography>
      </CardContent>
    </Card>

    {/* 7/7 Pièces justificatives */}
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight="bold" color="#C39408" mb={2}>
          7/7 Pièces justificatives & annexes
        </Typography>
        {documentsInfo.length ? (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Fichier</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documentsInfo.map((doc, i) => (
                <TableRow key={i}>
                  <TableCell>{doc.txt_description_fr}</TableCell>
                  <TableCell>
                    <a
                      href={`${process.env.REACT_APP_API_URL}/files/commandes/${new Date().getFullYear()}/${doc.file_guid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {doc.file_origin_name}
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography>Aucune pièce justificative ajoutée.</Typography>
        )}
      </CardContent>
    </Card>
  </Box>
);

export default OrderSummary;