import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getFilesRepoTypeofInfo, getOrderFilesInfo, setOrderFiles, delOrderFiles } from '../../../../services/apiServices';
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

  // chaque item : { id_order_files, file_origin_name, file_guid, fileTypeId, file: File || null }
useEffect(() => {
  const loadExisting = async () => {
    if (!orderId) return;
    try {
      const resp = await getOrderFilesInfo({
        p_id_order_list: orderId,
        p_isactive: true
      });
      const docs = resp.data;
      // regrouper par type
      const initial = {};
      docs.forEach(doc => {
        const typeId = String(doc.p_idfiles_repo_typeof);
        const entry = {
          id_order_files: doc.id_order_files,
          file: null, // pas de File JS, on ne renvoie que le nom
          name: doc.file_origin_name
        };
        initial[typeId] = initial[typeId]
          ? [...initial[typeId], entry]
          : [entry];
      });
      setUploads(initial);
    } catch (err) {
      console.error('Impossible de charger les docs existants', err);
    }
  };
  loadExisting();
}, [orderId]);


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

  const handleRemoveFile = async (fileTypeId, index) => {
       setUploads(prev => {
         const updated = [...(prev[fileTypeId] || [])];
         // on extrait l’élément supprimé
         const [ removed ] = updated.splice(index, 1);
    
         // si ce fichier venait déjà de la base (id_order_files présent),
         // on le supprime immédiatement côté serveur
         if (removed?.id_order_files) {
           delOrderFiles(removed.id_order_files)
             .catch(err => console.error('Erreur suppression serveur :', err));
         }
    
         // mise à jour locale
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
      <option key={ft.id_files_repo_typeof} value={ft.id_files_repo_typeof}>
        {ft.txt_description_fr}
      </option>
    ))}
  </select>
</Box>



  {/* 2. Upload du fichier */}
  {selectedJustificative && (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Button
        component="label"
        variant="contained"
        startIcon={<FontAwesomeIcon icon={faUpload} />}
        sx={customButtonStyle}
      >
        Ajouter fichier
        <VisuallyHiddenInput
          type="file"
          multiple
          onChange={e => handleFileChange(selectedJustificative, e)}
        />
      </Button>
      <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>
        Taille max 20 Mo; vous pouvez en sélectionner plusieurs.
      </Typography>
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
      {Uploads[selectedJustificative].map((file, idx) => (
  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
    <Typography variant="body2">{file.name}</Typography>
    <IconButton
      size="small"
      color="error"
      onClick={() => handleRemoveFile(selectedJustificative, idx)}
    >
      <FontAwesomeIcon icon={faTimes} />
    </IconButton>
  </Box>
))}

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
  {Object.entries(Uploads).flatMap(([typeId, entries]) =>
    entries.map((entry, idx) => {
      const desc = FileTypes.find(
        f => f.id_files_repo_typeof === +typeId
      )?.txt_description_fr;
      // S’il s’agit d’un File JS, entry.file est défini ; sinon on prend entry.name
      const filename = entry.file ? entry.file.name : entry.name;
      return (
        <TableRow key={`${typeId}-${idx}`}>
          <TableCell>{desc}</TableCell>
          <TableCell>{filename}</TableCell>
          <TableCell align="center">
            <IconButton
              size="small"
              onClick={() => handleRemoveFile(typeId, idx)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </IconButton>
          </TableCell>
        </TableRow>
      );
    })
  )}
</TableBody>

    </Table>
  </Box>
)}

</Box>


          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button
            variant="contained"
            onClick={prevStep}
            sx={{
              backgroundColor: '#DCAF26',
              '&:hover': {
                backgroundColor: '#C3A125',
              },
            }}
          >
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