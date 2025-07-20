import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEllipsisV, faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import './OperatorsList.css';
import { disableOperator, enableOperator, getOperatorList } from '../services/apiServices';
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
  useMediaQuery,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem as MuiMenuItem,
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

  // --- status filter state ---
  const [statusFilter, setStatusFilter] = useState('active');

  const fetchOperators = async () => {
    setLoading(true);
    try {
      const activeFlag = statusFilter === 'active';
      const response = await getOperatorList(null, null, activeFlag);
      setOperators(response.data);
      setError(null);
    } catch {
      setError('Erreur lors de la récupération des opérateurs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperators();
  }, [statusFilter]);

  const handleModalClose = async () => {
    setOpenRegisterModal(false);
    await fetchOperators();
  };

  const getGroupLabel = (roles, opIsAdmin) => {
    const labels = [];
    if (roles === 0) labels.push('Opérateur');
    if (roles === 1) labels.push('Opérateur avec pouvoir');
    if (opIsAdmin) labels.push('Administrateur');
    return labels.join(' ET ');
  };

  const handleEdit = (operatorId) => navigate(`/registerop/${operatorId}`);

  const handleEnable = async (id) => {
    if (!window.confirm('Réactiver cet opérateur ?')) return;
    await enableOperator(id);
    setOperators((prev) => prev.filter((op) => op.id_op_user !== id));
  };

  const handleDisable = async (operatorId) => {
    if (!window.confirm('Désactiver cet opérateur ?')) return;
    await disableOperator(operatorId);
    setOperators((prev) => prev.filter((op) => op.id_op_user !== operatorId));
  };

  const handleAddNew = () => {
    if (isAdmin) setOpenRegisterModal(true);
    else alert("Seul un administrateur peut créer un opérateur.");
  };

  const handleMenuOpen = (event, op) => {
    setAnchorEl(event.currentTarget);
    setSelectedOp(op);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOp(null);
  };

  const renderTableView = () => (
       <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
         <TableContainer sx={{ borderRadius: 4, overflow: 'hidden' }}>
           <Table sx={{ minWidth: 650 }}>
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
                  {(!op.isadmin || isAdmin) && (
                    <IconButton onClick={(e) => handleMenuOpen(e, op)}>
                      <FontAwesomeIcon icon={faEllipsisV} style={{ color: '#DCAF26' }} />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );

  const renderCardView = () => (
    <Grid container spacing={2}>
      {operators.map((op) => (
        <Grid item xs={12} key={op.id_op_user}>
          <Card>
            <CardContent>
              <Typography><strong>Nom :</strong> {op.full_name}</Typography>
              <Typography><strong>Login :</strong> {op.username}</Typography>
              <Typography>
                <strong>Email :</strong>{' '}
                <a href={`mailto:${op.email}`} style={{ color: '#DCAF26' }}>
                  {op.email}
                </a>
              </Typography>
              <Typography><strong>Tél :</strong> {op.phone_number}</Typography>
              <Typography><strong>Portable :</strong> {op.mobile_number}</Typography>
              <Typography><strong>Groupe :</strong> {getGroupLabel(op.roles, op.isadmin)}</Typography>
            </CardContent>
            <CardActions>
              {(!op.isadmin || isAdmin) && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleEdit(op.id_op_user)}
                  sx={{ color: '#DCAF26', borderColor: '#DCAF26' }}
                >
                  Modifier
                </Button>
              )}
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleDisable(op.id_op_user)}
                sx={{ color: '#DCAF26', borderColor: '#DCAF26' }}
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
    return <Box sx={{ ml: { xs: '2px', md: '240px' }, p: 3 }}><Typography>Chargement…</Typography></Box>;
  if (error)
    return <Box sx={{ ml: { xs: '2px', md: '240px' }, p: 3 }}><Typography color="error">{error}</Typography></Box>;

  return (
    <Box sx={{ ml: { xs: '2px', md: '240px' }, p: 3 }} className="operators-page-container">
      <AppBar position="static" color="default" sx={{ borderRadius: 4, overflow: 'hidden' }}>
        <Tabs
          value={tabIndex}
          onChange={(e, v) => setTabIndex(v)}
          indicatorColor="secondary"
          textColor="inherit"
          variant="fullWidth"
          sx={{ '& .MuiTabs-indicator': { backgroundColor: '#DCAF26' }, '& .MuiTab-root.Mui-selected': { color: '#DCAF26' } }}
        >
          <Tab label={`LISTING DES OPÉRATEURS (${operators.length})`} {...a11yProps(0)} />
        </Tabs>
      </AppBar>

      <TabPanel value={tabIndex} index={0}>
        {/* Ajouter */}
        <Box mb={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            size="small"
            onClick={handleAddNew}
            disabled={!isAdmin}
            startIcon={<FontAwesomeIcon icon={faPlus} />}
            sx={{ backgroundColor: '#DCAF26', border: 'none', fontSize: { xs: '0.7rem', sm: '0.85rem' }, px: 2 }}
          >
            Ajouter un opérateur
          </Button>
        </Box>

        {/* Filtre Active / Inactive */}
        {isSmallScreen ? (
          <FormControl size="small" sx={{ mb: 2, minWidth: 140 }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MuiMenuItem value="active">Actifs</MuiMenuItem>
              <MuiMenuItem value="inactive">Désactivés</MuiMenuItem>
            </Select>
          </FormControl>
        ) : (
          <FormControl component="fieldset" sx={{ mb: 2 }}>

            <RadioGroup
              row
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <FormControlLabel value="active" control={<Radio />} label="Opérateurs Actifs" />
              <FormControlLabel value="inactive" control={<Radio />} label="Opérateurs Désactivés" />
            </RadioGroup>
          </FormControl>
        )}

        {/* Liste ou Cartes */}
        {isSmallScreen ? renderCardView() : renderTableView()}
      </TabPanel>

      {/* Menu actions */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {(!selectedOp?.isadmin || isAdmin) && (
          <MenuItem onClick={() => { handleEdit(selectedOp?.id_op_user); handleMenuClose(); }}>
            <FontAwesomeIcon icon={faEdit} style={{ color: '#DCAF26', marginRight: 8 }} />Modifier
          </MenuItem>
        )}

        {isAdmin && statusFilter === 'active' && (
          <MenuItem onClick={() => { handleDisable(selectedOp?.id_op_user); handleMenuClose(); }}>
            <FontAwesomeIcon icon={faTrashAlt} style={{ color: '#DCAF26', marginRight: 8 }} />Désactiver
          </MenuItem>
        )}
        {isAdmin && statusFilter === 'inactive' && (
          <MenuItem onClick={() => { handleEnable(selectedOp?.id_op_user); handleMenuClose(); }}>
            <FontAwesomeIcon icon={faTrashAlt} style={{ color: '#DCAF26', marginRight: 8 }} />Activer
          </MenuItem>
        )}
      </Menu>

      {/* Modale création */}
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
