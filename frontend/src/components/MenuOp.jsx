// MenuOP.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../slices/authSlice';

import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import { Box, Toolbar, Divider } from '@mui/material';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faClipboardList,
  faFileInvoiceDollar,
  faHistory,
  faCog,
  faBuilding,
  faShoppingCart,
  faSignOutAlt,
  faDownload,
  faUsers,
  faUserTie,
  faHandshake,
  faFileContract,
  faMoneyBillWave,
  faUserPlus,
} from '@fortawesome/free-solid-svg-icons';

const drawerWidth = 240;

// Style appliqué aux items sélectionnés (fond orange, texte et icône en blanc)
const selectedStyle = {
  "&.Mui-selected": {
    backgroundColor: "#DCAF26",
    color: "white",
    "&:hover": {
      backgroundColor: "#DCAF26 !important",
    },
    "& .MuiListItemText-primary": {
      color: "white !important",
    },
    "& .MuiListItemIcon-root": {
      color: "white !important",
    },
  },
};

// Style spécifique pour le bouton "Déconnexion" : texte et icône en rouge
const logoutStyle = {
  color: "red",
  "& .MuiListItemText-primary": {
    color: "red !important",
  },
  "& .MuiListItemIcon-root": {
    color: "red !important",
  },
  "&:hover": {
    color: "red !important",
    backgroundColor: "inherit",
  },
};

const MenuOP = ({ isMenuOpen, toggleMenu }) => {
  const [openMenu, setOpenMenu] = useState({});
  const [activeLink, setActiveLink] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Fonction pour basculer l'ouverture d'un sous-menu
  const toggleSubmenu = (menu) => {
    setOpenMenu((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  // Fonction pour gérer le clic sur un lien
  const handleLinkClick = (menu, link) => {
    setActiveLink(link);
    // Si nécessaire, on peut forcer l'ouverture du sous-menu parent
    setOpenMenu((prev) => ({ ...prev, [menu]: true }));
    // Ferme le menu sur mobile
    if (window.innerWidth <= 768) {
      toggleMenu();
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={true}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "white",
          color: "black",
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: "auto" }}>
        <List>
          {/* Dashboard */}
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/dashboard/operator/dashboardoperateur"
              onClick={() => handleLinkClick('dashboardoperateur', 'dashboardoperateur')}
              selected={activeLink === 'dashboardoperateur'}
              sx={selectedStyle}
            >
              <ListItemIcon sx={{ color: "black" }}>
                <FontAwesomeIcon icon={faUserTie} />
              </ListItemIcon>
              <ListItemText primary="Dashboard Opérateur" primaryTypographyProps={{ fontSize: "14px" }} />
            </ListItemButton>
          </ListItem>
          <Divider sx={{ my: 1, bgcolor: "#FFFFFF", width: "50%", mx: "auto" }} />

          {/* Gestion des commandes */}
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/dashboard/operator"
              onClick={() => handleLinkClick('home', 'home')}
              selected={activeLink === 'home' || location.pathname === "/dashboard/operator"}
              sx={selectedStyle}
            >
              <ListItemIcon sx={{ color: "black" }}>
                <FontAwesomeIcon icon={faShoppingCart} />
              </ListItemIcon>
              <ListItemText primary="Gestion des commandes" primaryTypographyProps={{ fontSize: "14px" }} />
            </ListItemButton>
          </ListItem>
          <Divider sx={{ my: 1, bgcolor: "#FFFFFF", width: "50%", mx: "auto" }} />

          {/* Commandes & Factures */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => toggleSubmenu('orders')} sx={{ cursor: 'pointer' }}>
              <ListItemIcon sx={{ color: "black" }}>
                <FontAwesomeIcon icon={faClipboardList} />
              </ListItemIcon>
              <ListItemText primary="Commandes & Paiements" primaryTypographyProps={{ fontSize: "14px" }} />
            </ListItemButton>
          </ListItem>
          <Collapse in={openMenu.orders} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {/* Commandes en cours */}
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  to="/dashboard/operator/current-orders"
                  onClick={() => handleLinkClick('orders', 'currentOrders')}
                  selected={activeLink === 'currentOrders'}
                  sx={{ pl: 4, ...selectedStyle }}
                >
                  <ListItemIcon sx={{ color: "black" }}>
                    <FontAwesomeIcon icon={faShoppingCart} />
                  </ListItemIcon>
                  <ListItemText primary="Commandes en cours" primaryTypographyProps={{ fontSize: "12px" }} />
                </ListItemButton>
              </ListItem>
              {/* Recherches de commande */}
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  to="/dashboard/operator/search-orders"
                  onClick={() => handleLinkClick('orders', 'searchOrders')}
                  selected={activeLink === 'searchOrders'}
                  sx={{ pl: 4, ...selectedStyle }}
                >
                  <ListItemIcon sx={{ color: "black" }}>
                    <FontAwesomeIcon icon={faClipboardList} />
                  </ListItemIcon>
                  <ListItemText primary="Recherches de commande" primaryTypographyProps={{ fontSize: "12px" }} />
                </ListItemButton>
              </ListItem>
              {/* Historiques de commandes */}
              <ListItem disablePadding>
                <ListItemButton onClick={() => toggleSubmenu('orderHistory')} sx={{ pl: 4, cursor: 'pointer' }}>
                  <ListItemIcon sx={{ color: "black" }}>
                    <FontAwesomeIcon icon={faHistory} />
                  </ListItemIcon>
                  <ListItemText primary="Historiques de commandes" primaryTypographyProps={{ fontSize: "12px" }} />
                </ListItemButton>
              </ListItem>
              <Collapse in={openMenu.orderHistory} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      to="/orders/history/current-year"
                      onClick={() => handleLinkClick('orderHistory', 'historyCurrentYear')}
                      selected={activeLink === 'historyCurrentYear'}
                      sx={{ pl: 6, ...selectedStyle }}
                    >
                      <ListItemText primary={currentYear} primaryTypographyProps={{ fontSize: "12px" }} />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      to="/orders/history/previous-year"
                      onClick={() => handleLinkClick('orderHistory', 'historyPreviousYear')}
                      selected={activeLink === 'historyPreviousYear'}
                      sx={{ pl: 6, ...selectedStyle }}
                    >
                      <ListItemText primary={previousYear} primaryTypographyProps={{ fontSize: "12px" }} />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      to="/orders/history/before-previous-year"
                      onClick={() => handleLinkClick('orderHistory', 'historyBeforePreviousYear')}
                      selected={activeLink === 'historyBeforePreviousYear'}
                      sx={{ pl: 6, ...selectedStyle }}
                    >
                      <ListItemText primary={`Avant ${previousYear}`} primaryTypographyProps={{ fontSize: "12px" }} />
                    </ListItemButton>
                  </ListItem>
                </List>
              </Collapse>
              {/* Export des écritures */}
              <ListItem disablePadding>
                <ListItemButton onClick={() => toggleSubmenu('exportEntries')} sx={{ pl: 4, cursor: 'pointer' }}>
                  <ListItemIcon sx={{ color: "black" }}>
                    <FontAwesomeIcon icon={faDownload} />
                  </ListItemIcon>
                  <ListItemText primary="Export des écritures" primaryTypographyProps={{ fontSize: "12px" }} />
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse>
          <Divider sx={{ my: 1, bgcolor: "#FFFFFF", width: "50%", mx: "auto" }} />

          {/* Administration */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => toggleSubmenu('administration')} sx={{ cursor: 'pointer' }}>
              <ListItemIcon sx={{ color: "black" }}>
                <FontAwesomeIcon icon={faCog} />
              </ListItemIcon>
              <ListItemText primary="Administration" primaryTypographyProps={{ fontSize: "14px" }} />
            </ListItemButton>
          </ListItem>
          <Collapse in={openMenu.administration} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {/* Sous-menu "Clients" */}
              <ListItem disablePadding>
                <ListItemButton onClick={() => toggleSubmenu('clients')} sx={{ pl: 4, cursor: 'pointer' }}>
                  <ListItemIcon sx={{ color: "black" }}>
                    <FontAwesomeIcon icon={faUsers} />
                  </ListItemIcon>
                  <ListItemText primary="Clients" primaryTypographyProps={{ fontSize: "12px" }} />
                </ListItemButton>
              </ListItem>
              {openMenu.clients && (
                <Collapse in={openMenu.clients} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItem disablePadding>
                      <ListItemButton
                        component={Link}
                        to="/dashboard/operator/inscriptions"
                        onClick={() => handleLinkClick('clients', 'inscriptions')}
                        selected={activeLink === 'inscriptions'}
                        sx={{ pl: 6, ...selectedStyle }}
                      >
                        <ListItemIcon sx={{ color: "black" }}>
                          <FontAwesomeIcon icon={faUserPlus} />
                        </ListItemIcon>
                        <ListItemText primary="Nouvelles inscriptions" primaryTypographyProps={{ fontSize: "12px" }} />
                      </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemButton
                        component={Link}
                        to="/dashboard/operator/clientvalides"
                        onClick={() => handleLinkClick('clients', 'clientsvalides')}
                        selected={activeLink === 'clientsvalides'}
                        sx={{ pl: 6, ...selectedStyle }}
                      >
                        <ListItemIcon sx={{ color: "black" }}>
                          <FontAwesomeIcon icon={faUsers} />
                        </ListItemIcon>
                        <ListItemText primary="Listing Clients" primaryTypographyProps={{ fontSize: "12px" }} />
                      </ListItemButton>
                    </ListItem>
                  </List>
                </Collapse>
              )}

              {/* Sous-menu "Opérateurs" */}
              <ListItem disablePadding>
                <ListItemButton onClick={() => toggleSubmenu('operators')} sx={{ pl: 4, cursor: 'pointer' }}>
                  <ListItemIcon sx={{ color: "black" }}>
                    <FontAwesomeIcon icon={faUserTie} />
                  </ListItemIcon>
                  <ListItemText primary="Opérateurs" primaryTypographyProps={{ fontSize: "12px" }} />
                </ListItemButton>
              </ListItem>
              {openMenu.operators && (
                <Collapse in={openMenu.operators} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItem disablePadding>
                      <ListItemButton
                        component={Link}
                        to="/dashboard/operator/operatorslist"
                        onClick={() => handleLinkClick('operators', 'operatorslist')}
                        selected={activeLink === 'operatorslist'}
                        sx={{ pl: 6, ...selectedStyle }}
                      >
                        <ListItemIcon sx={{ color: "black" }}>
                          <FontAwesomeIcon icon={faUsers} />
                        </ListItemIcon>
                        <ListItemText primary="Liste des opérateurs" primaryTypographyProps={{ fontSize: "12px" }} />
                      </ListItemButton>
                    </ListItem>
                  </List>
                </Collapse>
              )}

              {/* Sous-menu "Prestations de services" */}
              <ListItem disablePadding>
                <ListItemButton onClick={() => toggleSubmenu('services')} sx={{ pl: 4, cursor: 'pointer' }}>
                  <ListItemIcon sx={{ color: "black" }}>
                    <FontAwesomeIcon icon={faHandshake} />
                  </ListItemIcon>
                  <ListItemText primary="Prestations de services" primaryTypographyProps={{ fontSize: "12px" }} />
                </ListItemButton>
              </ListItem>

              {/* Sous-menu "Données de base" */}
              <ListItem disablePadding>
                <ListItemButton onClick={() => toggleSubmenu('baseData')} sx={{ pl: 4, cursor: 'pointer' }}>
                  <ListItemIcon sx={{ color: "black" }}>
                    <FontAwesomeIcon icon={faCog} />
                  </ListItemIcon>
                  <ListItemText primary="Données de base" primaryTypographyProps={{ fontSize: "12px" }} />
                </ListItemButton>
              </ListItem>
              {openMenu.baseData && (
                <Collapse in={openMenu.baseData} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItem disablePadding>
                      <ListItemButton
                        component={Link}
                        to="/dashboard/operator/document-type"
                        onClick={() => handleLinkClick('baseData', 'document-type')}
                        selected={activeLink === 'document-type'}
                        sx={{ pl: 6, ...selectedStyle }}
                      >
                        <ListItemIcon sx={{ color: "black" }}>
                          <FontAwesomeIcon icon={faFileContract} />
                        </ListItemIcon>
                        <ListItemText primary="Type de document" primaryTypographyProps={{ fontSize: "12px" }} />
                      </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemButton
                        component={Link}
                        to="/dashboard/operator/list-type"
                        onClick={() => handleLinkClick('baseData', 'list-type')}
                        selected={activeLink === 'list-type'}
                        sx={{ pl: 6, ...selectedStyle }}
                      >
                        <ListItemIcon sx={{ color: "black" }}>
                          <FontAwesomeIcon icon={faClipboardList} />
                        </ListItemIcon>
                        <ListItemText primary="Liste des unités" primaryTypographyProps={{ fontSize: "12px" }} />
                      </ListItemButton>
                    </ListItem>
                  </List>
                </Collapse>
              )}
            </List>
          </Collapse>
          <Divider sx={{ my: 1, bgcolor: "#FFFFFF", width: "50%", mx: "auto" }} />

          {/* Ma CCD */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => toggleSubmenu('myCCD')} sx={{ cursor: 'pointer' }}>
              <ListItemIcon sx={{ color: "black" }}>
                <FontAwesomeIcon icon={faBuilding} />
              </ListItemIcon>
              <ListItemText primary="Ma CCD" primaryTypographyProps={{ fontSize: "14px" }} />
            </ListItemButton>
          </ListItem>
          <Collapse in={openMenu.myCCD} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  to="/dashboard/operator/inscriptions"
                  onClick={() => handleLinkClick('myCCD', 'cgv')}
                  selected={activeLink === 'cgv'}
                  sx={{ pl: 4, ...selectedStyle }}
                >
                  <ListItemIcon sx={{ color: "black" }}>
                    <FontAwesomeIcon icon={faFileContract} />
                  </ListItemIcon>
                  <ListItemText primary="Les C.G.V" primaryTypographyProps={{ fontSize: "12px" }} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  to="/dashboard/operator/tarifs"
                  onClick={() => handleLinkClick('myCCD', 'tarifs')}
                  selected={activeLink === 'tarifs'}
                  sx={{ pl: 4, ...selectedStyle }}
                >
                  <ListItemIcon sx={{ color: "black" }}>
                    <FontAwesomeIcon icon={faMoneyBillWave} />
                  </ListItemIcon>
                  <ListItemText primary="Tarifs des prestations" primaryTypographyProps={{ fontSize: "12px" }} />
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse>
          <Divider sx={{ my: 1, bgcolor: "#FFFFFF", width: "50%", mx: "auto" }} />

          {/* Bouton de déconnexion */}
          <Box sx={{ marginTop: 'auto' }}>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout} sx={logoutStyle}>
                <ListItemIcon sx={{ color: "inherit" }}>
                  <FontAwesomeIcon icon={faSignOutAlt} />
                </ListItemIcon>
                <ListItemText primary="Se déconnecter" primaryTypographyProps={{ fontSize: "14px" }} />
              </ListItemButton>
            </ListItem>
          </Box>
        </List>
      </Box>
    </Drawer>
  );
};

export default MenuOP;