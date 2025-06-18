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
import IconButton from '@mui/material/IconButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faTimes } from '@fortawesome/free-solid-svg-icons';

import { 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell 
} from '@mui/material';

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

const Step4 = ({ nextStep, prevStep, handleChange, values }) => {
  const params = new URLSearchParams(window.location.search);
  const certifId = params.get('certifId');
  const orderId = values.orderId;

  const user = useSelector((state) => state.auth.user);
  const idloginInsert = user?.id_login_user;

  const [copies, setCopies] = useState(values.copies || 1);
  const [generalRemark, setGeneralRemark] = useState(values.generalRemark || '');
  const [Uploads, setUploads] = useState({}); // { fileTypeId: [File, ...], ... }
  const [FileTypes, setFileTypes] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedJustificative, setSelectedJustificative] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const resp = await getFilesRepoTypeofInfo({
          p_id_files_repo_typeof_first: 500,
          p_id_files_repo_typeof_last: 649,
          p_ismandatory: null,
        });
        setFileTypes(resp.data);
      } catch {
        setErrorMessage("Erreur lors de la récupération des types de fichiers.");
      }
    })();
  }, []);

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

  const handleRemoveFile = (fileTypeId, index) => {
    setUploads(prev => {
      const updated = [...(prev[fileTypeId]||[])];
      updated.splice(index, 1);
      const next = { ...prev };
      if (updated.length) next[fileTypeId] = updated;
      else delete next[fileTypeId];
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const totalFiles = Object.values(Uploads).flat().length;
    if (totalFiles === 0) {
      alert("Vous devez uploader au moins un document.");
      return;
    }
    const allDocs = [];
    Object.entries(Uploads).forEach(([typeId, files]) => {
      const ft = FileTypes.find(f => f.id_files_repo_typeof === +typeId);
      files.forEach(file => {
        allDocs.push({ fileTypeId: +typeId, fileTypeDescription: ft.txt_description_fr, file });
      });
    });

    try {
      for (const doc of allDocs) {
        await setOrderFiles({
          uploadType: 'commandes',
          p_id_order: orderId,
          p_idfiles_repo_typeof: doc.fileTypeId,
          p_file_origin_name: doc.file.name,
          p_typeof_order: 1,
          p_idlogin_insert: idloginInsert,
          file: doc.file,
        });
      }
      handleChange('documents', allDocs);
      handleChange('copies', copies);
      handleChange('generalRemark', generalRemark);
      if (certifId) handleChange('certifId', certifId);
      if (orderId) handleChange('orderId', orderId);
      nextStep();
    } catch {
      alert("Erreur lors de l'upload des fichiers. Veuillez réessayer.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="step-form">
      <Slide in mountOnEnter unmountOnExit timeout={300}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            Upload de documents
          </Typography>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

<Box sx={{ mb: 4 }}>
  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
    Documents justificatifs
  </Typography>

  {/* 1. Sélection du type de pièce */}
  {!(selectedJustificative && Uploads[selectedJustificative]) && (
  <Box sx={{ mb: 2 }}>
    <Typography sx={{ mb: 1 }}>
      Sélectionnez une pièce à téléverser :
    </Typography>
    <select
      value={selectedJustificative}
      onChange={e => setSelectedJustificative(e.target.value)}
      style={{ padding: '8px', minWidth: '300px' }}
    >
      <option value="">-- Choisir une pièce --</option>
      {FileTypes.map(ft => (
        <option
          key={ft.id_files_repo_typeof}
          value={ft.id_files_repo_typeof}
        >
          {ft.txt_description_fr}
        </option>
      ))}
    </select>
  </Box>
)}


  {/* 2. Upload du fichier */}
  {selectedJustificative && !Uploads[selectedJustificative] && (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Button
        component="label"
        variant="contained"
        startIcon={<FontAwesomeIcon icon={faUpload} />}
        sx={customButtonStyle}
      >
        Choisir fichier
        <VisuallyHiddenInput
          type="file"
          multiple={false}
          onChange={e => handleFileChange(selectedJustificative, e)}
        />
      </Button>
    </Box>
  )}

  {/* 3. Affichage & validation */}
  {selectedJustificative && Uploads[selectedJustificative] && (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2">
        Fichier sélectionné pour :{' '}
        {
          FileTypes.find(f => f.id_files_repo_typeof === +selectedJustificative)
            ?.txt_description_fr
        }
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 2 }}>
        <Typography variant="body2">
          {Uploads[selectedJustificative][0].name}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setSelectedJustificative('')}
        >
          Valider
        </Button>
        <IconButton
          size="small"
          color="error"
          onClick={() => handleRemoveFile(selectedJustificative, 0)}
        >
          <FontAwesomeIcon icon={faTimes} />
        </IconButton>
      </Box>
    </Box>
  )}

  {/* 4. Ajouter une autre pièce */}
  {Object.keys(Uploads).length > 0 && !selectedJustificative && (
    <Box sx={{ mt: 3 }}>
      <Button
        variant="contained"
        sx={customButtonStyle}
        onClick={() => setSelectedJustificative('')}
      >
        Ajouter une autre pièce
      </Button>
    </Box>
  )}

  {/* 5. Liste des pièces déjà ajoutées */}
  {Object.entries(Uploads).length > 0 && (
  <Box sx={{ mt: 4 }}>
    <Typography variant="h6" sx={{ mb: 2 }}>
      Pièces ajoutées
    </Typography>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Type de pièce</TableCell>
          <TableCell>Nom du fichier</TableCell>
          <TableCell align="center">Supprimer</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {Object.entries(Uploads).flatMap(([typeId, files]) =>
          files.map((file, idx) => {
            const desc = FileTypes.find(
              f => f.id_files_repo_typeof === +typeId
            )?.txt_description_fr;
            return (
              <TableRow key={`${typeId}-${idx}`}>
                <TableCell>{desc}</TableCell>
                <TableCell>{file.name}</TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveFile(typeId, idx)}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </IconButton>
                </TableCell>
              </TableRow>
            )
          })
        )}
      </TableBody>
    </Table>
  </Box>
)}

</Box>


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