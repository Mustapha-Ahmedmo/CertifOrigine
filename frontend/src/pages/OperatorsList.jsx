import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEllipsisV, faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import './OperatorsList.css';
import { disableOperator, getOperatorList } from '../services/apiServices';
import { useSelector } from 'react-redux';
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
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Menu,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';
import RegisterOP from './RegisterOP';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
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
  const [tabIndex, setTabIndex] = useState(0);
  const [openRegisterModal, setOpenRegisterModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOp, setSelectedOp] = useState(null);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleTabChange = (event, newValue) => setTabIndex(newValue);
  const handleModalClose = () => setOpenRegisterModal(false);

  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const response = await getOperatorList(null, null, true);
        setOperators(response.data);
      } catch (err) {
        setError('Erreur lors de la récupération des opérateurs.');
      } finally {
        setLoading(false);
      }
    };
    fetchOperators();
  }, []);

  const getGroupLabel = (roles, opIsAdmin) => {
    const labels = [];
    if (roles === 0) labels.push('Opérateur');
    if (roles === 1) labels.push('Opérateur avec pouvoir');
    if (opIsAdmin) labels.push('Administrateur');
    return labels.join(' ET ');
  };

  const handleEdit = (operatorId) => navigate(`/registerop/${operatorId}`);
  const handleDelete = async (operatorId) => {
    if (window.confirm('Êtes-vous sûr de vouloir désactiver cet opérateur ?')) {
      try {
        await disableOperator(operatorId);
        setOperators((prev) => prev.filter((op) => op.id_op_user !== operatorId));
      } catch (err) {
        alert('Erreur lors de la désactivation.');
      }
    }
  };

  const handleAddNew = () => (isAdmin ? setOpenRegisterModal(true) : alert("Seul un administrateur peut créer un opérateur."));

  const handleMenuOpen = (event, op) => {
    setAnchorEl(event.currentTarget);
    setSelectedOp(op);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOp(null);
  };

  // Rendu du tableau (desktop)
  const renderTableView = () => (
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
                  <a href={`mailto:${op.email}`} style={{ color: '#DCAF26' }}>
                    {op.email}
                  </a>
                </TableCell>
                <TableCell>{op.phone_number}</TableCell>
                <TableCell>{op.mobile_number}</TableCell>
                <TableCell>{getGroupLabel(op.roles, op.isadmin)}</TableCell>
                <TableCell>
                  <IconButton onClick={(event) => handleMenuOpen(event, op)}>
                    <FontAwesomeIcon icon={faEllipsisV} style={{ color: '#DCAF26' }} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );

  // Rendu en mode Card (mobile)
  const renderCardView = () => (
    <Grid container spacing={2}>
      {operators.map((op) => (
        <Grid item xs={12} key={op.id_op_user}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2">
                <strong>Nom :</strong> {op.full_name}
              </Typography>
              <Typography variant="subtitle2">
                <strong>Login :</strong> {op.username}
              </Typography>
              <Typography variant="subtitle2">
                <strong>Email :</strong>{' '}
                <a href={`mailto:${op.email}`} style={{ color: '#DCAF26' }}>
                  {op.email}
                </a>
              </Typography>
              <Typography variant="subtitle2">
                <strong>Tél :</strong> {op.phone_number}
              </Typography>
              <Typography variant="subtitle2">
                <strong>Portable :</strong> {op.mobile_number}
              </Typography>
              <Typography variant="subtitle2">
                <strong>Groupe :</strong> {getGroupLabel(op.roles, op.isadmin)}
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleEdit(op.id_op_user)}
                style={{ color: '#DCAF26', borderColor: '#DCAF26' }}
              >
                Modifier
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleDelete(op.id_op_user)}
                style={{ color: '#DCAF26', borderColor: '#DCAF26' }}
              >
                Désactiver
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  if (loading)
    return (
      <Box sx={{ ml: { xs: '2px', md: '240px' }, p: 3 }}>
        <Typography>Chargement...</Typography>
      </Box>
    );
  if (error)
    return (
      <Box sx={{ ml: { xs: '2px', md: '240px' }, p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );

  return (
    <Box sx={{ ml: { xs: '2px', md: '240px' }, p: 3 }} className="operators-page-container">
      <AppBar position="static" color="default">
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          indicatorColor="secondary"
          textColor="inherit"
          variant="fullWidth"
          sx={{
            '& .MuiTabs-indicator': { backgroundColor: '#DCAF26' },
            '& .MuiTab-root.Mui-selected': { color: '#DCAF26' },
          }}
        >
          <Tab label={`LISTING DES OPÉRATEURS (${operators.length})`} {...a11yProps(0)} />
        </Tabs>
      </AppBar>
      <TabPanel value={tabIndex} index={0}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Button
            variant="contained"
            onClick={handleAddNew}
            startIcon={<FontAwesomeIcon icon={faPlus} style={{ color: '#DCAF26' }} />}
            style={{ backgroundColor: '#DCAF26', borderColor: '#DCAF26' }}
          >
            Ajouter un nouvel opérateur
          </Button>
        </Box>
        {isSmallScreen ? renderCardView() : renderTableView()}
      </TabPanel>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            handleEdit(selectedOp?.id_op_user);
            handleMenuClose();
          }}
        >
          <FontAwesomeIcon icon={faEdit} style={{ color: '#DCAF26', marginRight: 8 }} /> Modifier
        </MenuItem>
      </Menu>
      <Dialog open={openRegisterModal} onClose={handleModalClose} fullWidth maxWidth="md">
        <DialogTitle>Créer un Compte Opérateur</DialogTitle>
        <DialogContent>
          <RegisterOP onClose={handleModalClose} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default OperatorsList;
