import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getFilesRepoTypeofInfo, setOrderFiles } from '../../../../services/apiServices';
import Slide from '@mui/material/Slide';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import { styled } from '@mui/material/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';

// Définition de l'input caché
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const customButtonStyle = {
  backgroundColor: '#DDAF26',
  '&:hover': { backgroundColor: '#DDAF26' },
};

const customFieldStyle = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: '#DDAF26' },
    '&:hover fieldset': { borderColor: '#DDAF26' },
    '&.Mui-focused fieldset': { borderColor: '#DDAF26' },
  },
  '& label.Mui-focused': { color: '#DDAF26' },
};

const Step4 = ({ nextStep, prevStep, handleChange, values }) => {
  // Récupération des paramètres d'URL
  const params = new URLSearchParams(window.location.search);
  const certifId = params.get('certifId');
  const orderId = values.orderId;

  // Récupération de l'utilisateur depuis Redux
  const user = useSelector((state) => state.auth.user);
  const idloginInsert = user?.id_login_user;

  // États locaux
  const [copies, setCopies] = useState(values.copies || 1);
  const [generalRemark, setGeneralRemark] = useState(values.generalRemark || '');
  const [Uploads, setUploads] = useState({});
  const [FileTypes, setFileTypes] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedJustificative, setSelectedJustificative] = useState('');

  // Récupération des types de fichiers depuis le backend (unique appel avec p_ismandatory: null)
  useEffect(() => {
    const fetchFileTypes = async () => {
      try {
        const fileResponse = await getFilesRepoTypeofInfo({
          p_id_files_repo_typeof_first: 500,
          p_id_files_repo_typeof_last: 649,
          p_ismandatory: null,
        });
        setFileTypes(fileResponse.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des types de fichiers:", error);
        setErrorMessage("Erreur lors de la récupération des types de fichiers.");
      }
    };

    fetchFileTypes();
  }, []);

  // Gestion du changement de fichier pour un type donné
  const handleFileChange = (fileTypeId, e) => {
    if (!fileTypeId) {
      alert("Veuillez sélectionner une pièce.");
      return;
    }
    const files = Array.from(e.target.files); 
    setUploads(prev => ({
      ...prev,
      [fileTypeId]: prev[fileTypeId] ? [...prev[fileTypeId], ...files] : files,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Vérifier qu'au moins un fichier a été uploadé
    const uploadedFilesCount = Object.values(Uploads).flat().length;
    if (uploadedFilesCount === 0) {
      alert("Vous devez uploader au moins un document.");
      return;
    }

    // Construire l'array de tous les documents uploadés
    const allDocs = [];
    Object.keys(Uploads).forEach(fileTypeId => {
      const fileType = FileTypes.find(ft => ft.id_files_repo_typeof === parseInt(fileTypeId, 10));
      if (fileType) {
        Uploads[fileTypeId].forEach(file => {
          allDocs.push({
            fileTypeId: fileType.id_files_repo_typeof,
            fileTypeDescription: fileType.txt_description_fr,
            file: file,
          });
        });
      }
    });

    try {
      for (const doc of allDocs) {
        const orderFileData = {
          uploadType: 'commandes',
          p_id_order: orderId,
          p_idfiles_repo_typeof: doc.fileTypeId,
          p_file_origin_name: doc.file.name,
          p_typeof_order: 0,
          p_idlogin_insert: idloginInsert,
          file: doc.file,
        };

        await setOrderFiles(orderFileData);
      }

      handleChange('documents', allDocs);
      handleChange('copies', copies);
      handleChange('generalRemark', generalRemark);
      if (certifId) handleChange('certifId', certifId);
      if (orderId) handleChange('orderId', orderId);

      nextStep();
    } catch (error) {
      console.error("Erreur lors de l'upload des fichiers:", error);
      alert("Erreur lors de l'upload des fichiers. Veuillez réessayer.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="step-form">
      <Slide in={true} mountOnEnter unmountOnExit timeout={300}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            Upload de documents
          </Typography>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          {/* Section unique d'upload de documents */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Documents
            </Typography>
            <select
              value={selectedJustificative}
              onChange={(e) => setSelectedJustificative(e.target.value)}
            >
              <option value="">-- Sélectionnez une pièce --</option>
              {FileTypes.map(fichier => (
                <option key={fichier.id_files_repo_typeof} value={fichier.id_files_repo_typeof}>
                  {fichier.txt_description_fr}
                </option>
              ))}
            </select>
            <Button component="label" variant="contained" sx={{ ml: 2, ...customButtonStyle }}>
              Choisir fichier
              <VisuallyHiddenInput
                type="file"
                multiple
                onChange={(e) => handleFileChange(selectedJustificative, e)}
              />
            </Button>
            {Object.values(Uploads).flat().map((file, index) => (
              <Typography key={index} variant="body2">
                {file.name}
              </Typography>
            ))}
          </Box>

          {/* Remarques générales */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Remarques générales
            </Typography>
            <TextField
              multiline
              minRows={4}
              fullWidth
              placeholder="Ajouter des remarques générales pour les pièces justificatives"
              value={generalRemark}
              onChange={(e) => setGeneralRemark(e.target.value)}
              variant="outlined"
              sx={customFieldStyle}
            />
          </Box>

          {/* Boutons d'action */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button variant="outlined" onClick={prevStep}>
              Retour
            </Button>
            <Button variant="contained" type="submit" sx={customButtonStyle}>
              Suivant
            </Button>
          </Box>
        </Box>
      </Slide>
    </form>
  );
};

export default Step4;