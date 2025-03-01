import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, IconButton } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';

const Footer = () => {
  const [isBottom, setIsBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Vérifie si l'utilisateur est tout en bas de la page (tolérance de 2px)
      const bottom =
        window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 2;
      setIsBottom(bottom);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isBottom) {
    return null;
  }

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'white',
        py: 2,
        boxShadow: '0 -2px 5px rgba(0,0,0,0.1)',
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
          position: 'relative',
          ml: '300px', // Décalage vers la droite pour recentrer le contenu
        }}
      >
        {/* Ligne 1 : Titre centré */}
        <Typography
          variant="body2"
          color="text.primary"
          sx={{ fontWeight: 'bold', textAlign: 'center' }}
        >
          Chambre de Commerce de Djibouti.
        </Typography>

        {/* Ligne 2 : Adresse et Email */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: 'center' }}
        >
          Adresse : Place Lagarde, Djibouti - +(253) 21 35 10 70 | Email: ccd@ccd.dj
        </Typography>

        {/* Ligne 3 : Icônes avec liens */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <IconButton
            component="a"
            href="https://ccd.dj"
            target="_blank"
            rel="noopener noreferrer"
          >
            <LanguageIcon />
          </IconButton>
          <IconButton
            component="a"
            href="https://www.linkedin.com/company/chambre-de-commerce-de-djibouti/?originalSubdomain=fr"
            target="_blank"
            rel="noopener noreferrer"
          >
            <LinkedInIcon sx={{ color: '#0077B5' }} />
          </IconButton>
          <IconButton
            component="a"
            href="https://x.com/i/flow/login?redirect_after_login=%2Fccdjibouti"
            target="_blank"
            rel="noopener noreferrer"
          >
            <TwitterIcon sx={{ color: '#1DA1F2' }} />
          </IconButton>
        </Box>

        {/* Ligne 4 : Copyright */}
        <Typography
          variant="body2"
          color="text.primary"
          sx={{ textAlign: 'center' }}
        >
          2025 Axentra. All right reserved
        </Typography>

        {/* Version en dur dans le coin inférieur droit */}
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            color: 'grey.800',
            fontWeight: 'bold',
          }}
        >
          1.3.1
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
