import React from 'react';
import { Box, Typography } from '@mui/material';

const MentionsLegalesPage = () => (
  <>
    {/* Titre rouge centré */}
    <Box sx={{ textAlign: 'center', my: 3 }}>
      <Typography variant="h5" sx={{ color: 'red', fontWeight: 'bold' }}>
        Données en attente de la Chambre de Commerce
      </Typography>
    </Box>

    {/* Contenu principal */}
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Mentions légales
      </Typography>

      <Typography variant="body2" gutterBottom>
        Conformément aux dispositions des articles 6‐III et 19 de la loi n°2004‐575 du
        21 juin 2004 pour la confiance dans l’économie numérique, dite L.C.E.N., nous
        portons à la connaissance des utilisateurs et visiteurs du site :
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        1. Éditeur
      </Typography>
      <Typography variant="body2" gutterBottom>
        Le site [NOM DU SITE] est édité par la Chambre de Commerce de Djibouti,  
        Siège social : Place Djibouti,  
        Tél. : +253 21 35 10 70  
        Email : <a href="mailto:ccd@ccd.dj">ccd@ccd.dj</a>  
        Directeur de la publication : Mme Zabra Omar Ahmed  
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        2. Hébergement
      </Typography>
      <Typography variant="body2" gutterBottom>
        Le site est hébergé par [NOM DE L’HÉBERGEUR],  
        Adresse : [Adresse complète],  
        Tél. : [Téléphone],  
        Email : [Email].
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        3. Propriété intellectuelle
      </Typography>
      <Typography variant="body2" align="justify" gutterBottom>
        Tous les contenus, marques, images, logos, et data présents sur ce site sont
        la propriété exclusive de la CCD ou de leurs auteurs. Toute reproduction
        totale ou partielle est interdite sans autorisation.
      </Typography>

      <Typography variant="body2" align="right" sx={{ mt: 4 }}>
        Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
      </Typography>
    </Box>
  </>
);

export default MentionsLegalesPage;
