import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getFilesRepoTypeofInfo, setOrderFiles } from '../../../../services/apiServices';
import Slide from '@mui/material/Slide';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
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
  const [mandatoryUploads, setMandatoryUploads] = useState({});
  const [optionalUploads, setOptionalUploads] = useState({});
  const [Uploads, setUploads] = useState({});
  const [mandatoryFileTypes, setMandatoryFileTypes] = useState([]);
  const [FileTypes, setFileTypes] = useState([]);
  const [optionalFileTypes, setOptionalFileTypes] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedJustificative, setSelectedJustificative] = useState('');


  // Récupération des types de fichiers depuis le backend
  useEffect(() => {
    const fetchFileTypes = async () => {
      try {
        const mandatoryResponse = await getFilesRepoTypeofInfo({
          p_id_files_repo_typeof_first: 500,
          p_id_files_repo_typeof_last: 649,
          p_ismandatory: true,
        });
        setMandatoryFileTypes(mandatoryResponse.data);

        const optionalResponse = await getFilesRepoTypeofInfo({
          p_id_files_repo_typeof_first: 500,
          p_id_files_repo_typeof_last: 649,
          p_ismandatory: false,
        });
        setOptionalFileTypes(optionalResponse.data);

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

  const handleMandatoryFileChange = (fileTypeId, e) => {
    const file = e.target.files[0];
    setMandatoryUploads(prev => ({ ...prev, [fileTypeId]: file }));
  };

  const handleOptionalFileChange = (fileTypeId, e) => {
    const file = e.target.files[0];
    setOptionalUploads(prev => ({ ...prev, [fileTypeId]: file }));
  };
  const handleFileChange = (fileTypeId, e) => {
    const files = Array.from(e.target.files); 
    setUploads(prev => ({
      ...prev,
      [fileTypeId]: prev[fileTypeId] ? [...prev[fileTypeId], ...files] : files,
    }));
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    for (let ft of mandatoryFileTypes) {
      if (!mandatoryUploads[ft.id_files_repo_typeof]) {
        alert(`Le document obligatoire "${ft.txt_description_fr}" est manquant.`);
        return;
      }
    }

    const mandatoryDocs = mandatoryFileTypes.map(ft => ({
      fileTypeId: ft.id_files_repo_typeof,
      fileTypeDescription: ft.txt_description_fr,
      file: mandatoryUploads[ft.id_files_repo_typeof],
    }));

    const optionalDocs = optionalFileTypes.reduce((acc, ft) => {
      if (optionalUploads[ft.id_files_repo_typeof]) {
        acc.push({
          fileTypeId: ft.id_files_repo_typeof,
          fileTypeDescription: ft.txt_description_fr,
          file: optionalUploads[ft.id_files_repo_typeof],
        });
      }
      return acc;
    }, []);


    const AllDocs = FileTypes.reduce((acc, ft) => {
      if (Uploads[ft.id_files_repo_typeof]) {
        acc.push({
          fileTypeId: ft.id_files_repo_typeof,
          fileTypeDescription: ft.txt_description_fr,
          file: AllDocs[ft.id_files_repo_typeof],
        });
      }
      return acc;
    }, []);


    const allDocs = [...mandatoryDocs, ...optionalDocs, ...allDocs];

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

  console.log("Uploads ", Uploads);

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

          {/* Documents obligatoires */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Documents obligatoires
            </Typography>
            {mandatoryFileTypes.map(ft => (
              <Box key={ft.id_files_repo_typeof} sx={{ mb: 2 }}>
                <Typography variant="body1">
                  {ft.txt_description_fr}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {ft.txt_description_eng}
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={
                      <FontAwesomeIcon icon={faUpload} style={{ fontSize: '16px' }} />
                    }
                    sx={customButtonStyle}
                  >
                    Choisir fichier
                    <VisuallyHiddenInput
                      type="file"
                      onChange={(e) => handleMandatoryFileChange(ft.id_files_repo_typeof, e)}
                      required
                    />
                  </Button>
                  {mandatoryUploads[ft.id_files_repo_typeof] && (
                    <Typography variant="body2">
                      {mandatoryUploads[ft.id_files_repo_typeof].name}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>


          {/* Documents MAJ */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Documents obligatoires
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
        <Button component="label" variant="contained" sx={customButtonStyle}>
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

          {/* Documents optionnels et remarques générales */}
          <Box sx={{ mb: 4 }}>
            {optionalFileTypes.length > 0 && (
              <>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Documents optionnels
                </Typography>
                {optionalFileTypes.map(ft => (
                  <Box key={ft.id_files_repo_typeof} sx={{ mb: 2 }}>
                    <Typography variant="body1">
                      {ft.txt_description_fr}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {ft.txt_description_eng}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Button
                        component="label"
                        variant="contained"
                        startIcon={
                          <FontAwesomeIcon icon={faUpload} style={{ fontSize: '16px' }} />
                        }
                        sx={customButtonStyle}
                      >
                        Choisir fichier
                        <VisuallyHiddenInput
                          type="file"
                          onChange={(e) => handleOptionalFileChange(ft.id_files_repo_typeof, e)}
                        />
                      </Button>
                      {optionalUploads[ft.id_files_repo_typeof] && (
                        <Typography variant="body2">
                          {optionalUploads[ft.id_files_repo_typeof].name}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </>
            )}

            <Box sx={{ mt: 3 }}>
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
