import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';
import './OperatorsList.css';

import { disableOperator, getOperatorList } from '../services/apiServices';
import { useSelector } from 'react-redux';

// --- Import MUI ---
import {
  Box,
  AppBar,
  Tabs,
  Tab,
  Typography,
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
} from '@mui/material';

// Fonctions utilitaires pour la gestion de TabPanel
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`operators-tabpanel-${index}`}
      aria-labelledby={`operators-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `operators-tab-${index}`,
    'aria-controls': `operators-tabpanel-${index}`,
  };
}

const OperatorsList = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.isadmin_login;

  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pour la gestion des onglets (ici, un seul onglet "Listing Opérateurs")
  const [tabIndex, setTabIndex] = useState(0);
  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  // Récupération des opérateurs
  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const response = await getOperatorList(null, null, true);
        setOperators(response.data);
      } catch (err) {
        setError('Erreur lors de la récupération des opérateurs.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOperators();
  }, []);

  const getGroupLabel = (roles) => {
    const labels = [];
    if (roles === 1) labels.push('Administrateur');
    if (roles === 2) labels.push('Opérateur avec pouvoir');
    return labels.join(' ET ');
  };

  const handleEdit = (operatorId) => {
    navigate(`/registerop/${operatorId}`);
  };

  const handleDelete = async (operatorId) => {
    if (window.confirm('Êtes-vous sûr de vouloir désactiver cet opérateur ?')) {
      try {
        await disableOperator(operatorId);
        setOperators((prevOperators) =>
          prevOperators.filter((op) => op.id_op_user !== operatorId)
        );
        alert('Opérateur désactivé avec succès.');
      } catch (err) {
        alert('Erreur lors de la désactivation de l’opérateur.');
        console.error(err);
      }
    }
  };

  const handleAddNew = () => {
    if (isAdmin) {
      navigate('/registerop');
    } else {
      alert("Seul un administrateur peut créer un nouvel opérateur.");
    }
  };

  // Affichage conditionnel : Loading ou Erreur
  if (loading) {
    return (
      <Box sx={{ ml: '240px', p: 3 }}>
        <Typography>Chargement...</Typography>
      </Box>
    );
  }
  if (error) {
    return (
      <Box sx={{ ml: '240px', p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    // Décalage pour la sidebar
    <Box sx={{ ml: '240px', p: 3 }}>
      {/* Barre d’onglets */}
      <AppBar position="static" color="default">
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          indicatorColor="secondary"
          textColor="inherit"
          variant="fullWidth"
          aria-label="Operators Tabs"
        >
          <Tab
            label={`LISTING DES OPÉRATEURS (${operators.length})`}
            {...a11yProps(0)}
          />
        </Tabs>
      </AppBar>

      {/* Contenu onglet 0 */}
      <TabPanel value={tabIndex} index={0}>
        {/* En-tête : Bouton "Ajouter un nouvel opérateur" */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
         
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddNew}
            startIcon={<FontAwesomeIcon icon={faPlus} />}
          >
            Ajouter un nouvel opérateur
          </Button>
        </Box>

        {/* Tableau MUI */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Login</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Tél</TableCell>
                  <TableCell>Portable</TableCell>
                  <TableCell>Groupe</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {operators.map((op) => (
                  <TableRow key={op.id_op_user}>
                    <TableCell>{op.full_name}</TableCell>
                    <TableCell>{op.username}</TableCell>
                    <TableCell>
                      <a href={`mailto:${op.email}`}>{op.email}</a>
                    </TableCell>
                    <TableCell>{op.phone_number}</TableCell>
                    <TableCell>{op.mobile_number}</TableCell>
                    <TableCell>{getGroupLabel(op.roles)}</TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleEdit(op.id_op_user)}
                          startIcon={<FontAwesomeIcon icon={faEdit} />}
                        >
                          Modifier
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleDelete(op.id_op_user)}
                          startIcon={<FontAwesomeIcon icon={faTrashAlt} />}
                        >
                          Supprimer
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>
    </Box>
  );
};

export default OperatorsList;
