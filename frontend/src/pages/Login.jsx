import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { login } from '../slices/authSlice';
import { loginUser } from '../services/apiServices';
import { homemadeHash } from '../utils/hashUtils';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import logo from '../assets/logo3.jpeg';
import backgroundImage from '../assets/image_ccd.jpeg';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser(username, homemadeHash(password));
      dispatch(
        login({
          user: response.user,
          token: response.token,
        })
      );
      navigate('/dashboard');
    } catch (error) {
      setErrorMessage("Certaines de vos informations sont incorrectes. Réessayez.");
    }
  };

  return (
    <Box
      display="flex"
      flexDirection={isMobile ? 'column' : 'row'}
      justifyContent="space-around"
      alignItems="center"
      minHeight="100vh"
      sx={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        p: 2,
      }}
    >
      {/* Colonne gauche : informations */}
      <Box
        sx={{
          maxWidth: isMobile ? '90%' : 600,
          color: 'white',
          textAlign: isMobile ? 'center' : 'left',
          mt: isMobile ? 2 : '10rem',
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontSize: isMobile ? '40px' : '70px',
            color: '#FFD863',
            mb: 1,
          }}
        >
          Certificat d'origine Électronique
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 'bold',
            fontSize: isMobile ? '18px' : '22px',
            mb: 2,
            color: '#ffffff',
          }}
        >
          La Chambre de Commerce de Djibouti (CCD) est habilitée à effectuer une partie des
          formalités requises par les activités à l'international des entreprises. La CCD délivre
          les Certificats d'origine et légalise les documents commerciaux : Facture commerciales,
          Contrats, Licences de vente, etc.
        </Typography>
        <Button variant="contained" color="warning" size="small">
          Lire plus
        </Button>
      </Box>

      {/* Carte de connexion */}
      <Card
        sx={{
          p: 4,
          borderRadius: 2,
          boxShadow: 3,
          maxWidth: 400,
          width: '100%',
          mt: isMobile ? 2 : '10rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box
          component="img"
          src={logo}
          alt="Logo"
          sx={{ width: isMobile ? 100 : 120, mb: 2 }}
        />
        {/* Titre "Connexion" avec taille 25px */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 2,
            color: theme.palette.text.primary,
            fontSize: '25px',
          }}
        >
          Connexion
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <TextField
            label="E-mail"
            variant="outlined"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{
              mb: 2,
              backgroundColor: '#eaeaea',
              borderRadius: 1,
            }}
          />
          <TextField
            label="Mot de passe"
            variant="outlined"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              mb: 2,
              backgroundColor: '#eaeaea',
              borderRadius: 1,
            }}
          />
          {errorMessage && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {errorMessage}
            </Alert>
          )}
          <Link
            component={RouterLink}
            to="/forgot-password"
            sx={{ color: '#D34600', mb: 2, alignSelf: 'flex-start' }}
          >
            Mot de passe oublié ?
          </Link>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
              gap: 2,
              mt: 2,
            }}
          >
            <Button
              component={RouterLink}
              to="/register"
              variant="outlined"
              color="warning"
              size="small"
              sx={{ flex: 1 }}
            >
              Créer un compte
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="warning"
              size="small"
              sx={{ flex: 1 }}
            >
              Se connecter
            </Button>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default Login;
