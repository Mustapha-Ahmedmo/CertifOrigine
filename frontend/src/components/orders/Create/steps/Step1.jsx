import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
// Si votre fichier CSS global (ex: Step1.css ou CreateOrder.css) applique des styles aux messages d'erreur,
// vous pouvez le commenter pour éviter les conflits.
// import './Step1.css';

const Step1 = ({ nextStep, handleChange, values }) => {
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!values.orderName || values.orderName.trim() === '') {
      setErrorMessage('Le nom de la commande est requis.');
      return;
    }
    setErrorMessage('');
    nextStep(); // Passe à l'étape suivante
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Nom de la commande"
          variant="outlined"
          value={values.orderName}
          onChange={(e) => handleChange('orderName', e.target.value)}
          placeholder="Entrez le nom de la commande"
          required
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#DDAF26' },
              '&:hover fieldset': { borderColor: '#DDAF26' },
              '&.Mui-focused fieldset': { borderColor: '#DDAF26' },
            },
            '& label.Mui-focused': { color: '#DDAF26' },
          }}
        />
        {errorMessage && (
          <Alert
            severity="error"
            sx={{
              width: '100%',
              mt: 2,
              // Forcer l'override pour utiliser le style par défaut de MUI Alert
              fontWeight: 'normal !important',
              color: 'inherit !important',
              backgroundColor: (theme) => theme.palette.error.light + ' !important',
            }}
          >
            {errorMessage}
          </Alert>
        )}
        <Button
          variant="contained"
          type="submit"
          sx={{
            backgroundColor: '#DDAF26',
            '&:hover': { backgroundColor: '#DDAF26' },
          }}
        >
          Créer et continuer
        </Button>
      </Box>
    </form>
  );
};

export default Step1;
