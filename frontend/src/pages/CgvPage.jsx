// src/pages/CgvPage.jsx
import React, { useState } from 'react';
import { Box, Typography, FormControlLabel, Checkbox } from '@mui/material';
import './CgvPage.css';

const CgvPage = () => {
  const [isCommitted, setIsCommitted] = useState(false);

  const handleChange = (e) => {
    setIsCommitted(e.target.checked);
  };

  return (
    
    <div className="cgv-page-container">
      {/* Titre rouge */}
      <Box sx={{ textAlign: 'center', my: 3, mt: 0 }}>
        <Typography variant="h5" sx={{ color: 'red', fontWeight: 'bold' }}>
          Données en attente de la Chambre de Commerce
        </Typography>
      </Box>
      <Box sx={{ py: 2 }}>
        <Typography variant="h4" gutterBottom>
          Conditions Générales d'Utilisation – Création de Certificat d'Origine
        </Typography>

        <Typography variant="body2" align="justify" gutterBottom>
          En utilisant notre site pour créer un certificat d'origine, vous reconnaissez
          avoir pris connaissance et accepter sans réserve les présentes Conditions Générales
          d'Utilisation (CGU). Ces CGU régissent votre utilisation de notre formulaire en
          ligne et la création du certificat d'origine.
        </Typography>

        <Typography variant="h6" gutterBottom>1. Objet</Typography>
        <Typography variant="body2" align="justify" gutterBottom>
          Les présentes conditions ont pour objet de définir les droits et obligations de
          l’utilisateur qui souhaite obtenir un certificat d'origine en remplissant
          l’intégralité du formulaire mis à disposition sur notre site. En soumettant
          vos informations, vous engagez votre responsabilité quant à leur exactitude
          et leur véracité.
        </Typography>

        <Typography variant="h6" gutterBottom>2. Acceptation des CGU</Typography>
        <Typography variant="body2" align="justify" gutterBottom>
          En remplissant le formulaire et en cliquant sur le bouton de validation, vous
          déclarez accepter pleinement et sans réserve l’intégralité des présentes CGU.
          Si vous n’acceptez pas ces conditions, vous ne devez pas utiliser notre service
          de création de certificat d'origine.
        </Typography>

        <Typography variant="h6" gutterBottom>3. Engagements et Obligations de l’Utilisateur</Typography>
        <Typography variant="body2" align="justify" gutterBottom>
          <strong>Exactitude des Informations :</strong> Vous garantissez que toutes les
          informations renseignées dans le formulaire sont complètes, exactes et à jour.
          Toute fausse déclaration ou omission volontaire pouvant entraîner des erreurs
          dans le certificat d'origine relève de votre seule responsabilité.
          <br /><br />
          <strong>Authenticité :</strong> Vous vous engagez à fournir des données
          authentiques et vérifiables, notamment concernant l'origine, la destination,
          les caractéristiques des marchandises, ainsi que toute autre information requise
          pour l’établissement du certificat.
          <br /><br />
          <strong>Mise à jour des Données :</strong> Vous vous engagez à actualiser vos
          informations en cas de changement, afin de garantir la conformité et la validité
          du certificat d'origine établi.
          <br /><br />
          <strong>Respect de la Procédure :</strong> Vous acceptez de suivre la procédure
          de validation proposée par notre plateforme, notamment en validant chacune des
          sections du formulaire et en confirmant la véracité des informations avant
          la soumission finale.
        </Typography>

        <Typography variant="h6" gutterBottom>4. Responsabilité et Limitation</Typography>
        <Typography variant="body2" align="justify" gutterBottom>
          <strong>Responsabilité de l’Utilisateur :</strong> En cas d’erreur, d’omission
          ou de fourniture d’informations inexactes, notre site ne pourra être tenu
          responsable des conséquences pouvant en découler, tant sur le plan légal
          qu’administratif.
          <br /><br />
          <strong>Exclusion de Garantie :</strong> Notre plateforme est fournie « en l'état ».
          Bien que nous nous efforcions de garantir la qualité et la fiabilité de notre
          service, nous ne saurions être tenus responsables d’éventuels dysfonctionnements,
          retards ou interruptions pouvant affecter la création du certificat d'origine.
          <br /><br />
          <strong>Force Majeure :</strong> Notre responsabilité ne saurait être engagée
          en cas de force majeure, notamment en cas de perturbations indépendantes de
          notre volonté affectant le fonctionnement de notre système ou l’exactitude
          des données.
        </Typography>

        <Typography variant="h6" gutterBottom>5. Confidentialité et Protection des Données</Typography>
        <Typography variant="body2" align="justify" gutterBottom>
          <strong>Collecte et Utilisation :</strong> Les informations que vous
          renseignez dans le formulaire sont collectées dans le seul but de générer
          un certificat d'origine et d’assurer la bonne exécution de la procédure
          administrative afférente.
          <br /><br />
          <strong>Sécurité :</strong> Nous mettons en œuvre des mesures techniques
          et organisationnelles appropriées pour protéger vos données personnelles
          contre tout accès non autorisé ou toute divulgation abusive.
          <br /><br />
          <strong>Accès et Rectification :</strong> Vous disposez d’un droit d’accès,
          de rectification et de suppression de vos données. Pour exercer ce droit,
          veuillez consulter notre politique de confidentialité ou contacter
          notre service dédié.
        </Typography>

        <Typography variant="h6" gutterBottom>6. Propriété Intellectuelle</Typography>
        <Typography variant="body2" align="justify" gutterBottom>
          Tous les éléments (textes, images, logos, etc.) présents sur notre site
          restent la propriété exclusive de notre entreprise ou de ses partenaires.
          Toute reproduction, modification ou distribution, même partielle,
          est strictement interdite sans autorisation préalable.
        </Typography>

        <Typography variant="h6" gutterBottom>7. Modification des Conditions</Typography>
        <Typography variant="body2" align="justify" gutterBottom>
          Nous nous réservons le droit de modifier les présentes CGU à tout moment.
          Les modifications seront applicables dès leur mise en ligne et vous seront
          communiquées via notre site. Il vous appartient de consulter régulièrement
          ces conditions afin de prendre connaissance de toute mise à jour.
        </Typography>

        <Typography variant="h6" gutterBottom>8. Droit Applicable et Juridiction Compétente</Typography>
        <Typography variant="body2" align="justify" gutterBottom>
          Les présentes CGU sont régies par le droit en vigueur dans le pays de notre
          siège social. En cas de litige relatif à l'interprétation ou à l'exécution
          des présentes conditions, les tribunaux compétents seront ceux du ressort
          de notre siège social.
        </Typography>

        <Typography variant="h6" gutterBottom>9. Acceptation Finale</Typography>
        <Typography variant="body2" align="justify" gutterBottom>
          En validant le formulaire de création du certificat d'origine, vous reconnaissez
          avoir lu, compris et accepté l'ensemble des présentes Conditions Générales
          d'Utilisation. Vous vous engagez à respecter toutes les obligations qui y sont
          stipulées et assumez l'entière responsabilité de l'exactitude des informations
          fournies.
        </Typography>
      </Box>

  
    </div>
  );
};

export default CgvPage;
