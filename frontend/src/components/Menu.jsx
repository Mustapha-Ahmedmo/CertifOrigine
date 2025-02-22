// Menu.jsx
import React, { useState, useEffect } from 'react';
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
  faTachometerAlt,
  faShoppingCart,
  faHistory,
  faUsers,
  faHome,
  faCheckCircle,
  faDollarSign,
  faArrowCircleLeft,
  faCertificate,
  faGavel,
  faFileInvoice,
  faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons';

const drawerWidth = 240;

const Menu = ({ isMenuOpen, toggleMenu }) => {
  const [openSubmenus, setOpenSubmenus] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Ouvrir automatiquement certains sous-menus selon l'URL courante
  useEffect(() => {
    // Si on est dans une sous-page de /dashboard, ouvrir le sous-menu "dashboard"
    if (location.pathname.startsWith('/dashboard/to-complete') ||
        location.pathname.startsWith('/dashboard/to-pay') ||
        location.pathname.startsWith('/dashboard/returned-orders')) {
      setOpenSubmenus((prev) => ({ ...prev, dashboard: true }));
    }

    // Si on est dans l'une des sous-pages de "Nouvelle Commande"
    if (location.pathname.startsWith('/dashboard/create-order') ||
        location.pathname.startsWith('/dashboard/legalization') ||
        location.pathname.startsWith('/dashboard/commercial-invoice')) {
      setOpenSubmenus((prev) => ({ ...prev, newOrder: true }));
    }

    // Si on est dans l'une des sous-pages de "Mes commandes passées"
    // (Tu peux ajuster selon les URLs réelles)
    if (location.pathname === '/' /* ex. si tu utilises '/' pour afficher le passé */) {
      setOpenSubmenus((prev) => ({ ...prev, pastOrders: true }));
    }

    // Si on est dans la page "Mes destinataires"
    if (location.pathname.startsWith('/dashboard/destinatairelist')) {
      setOpenSubmenus((prev) => ({ ...prev, clients: true }));
    }
  }, [location]);

  const handleToggleSubmenu = (menu) => {
    setOpenSubmenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  // Permet de refermer le menu sur mobile après un clic
  const handleLinkClick = () => {
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
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: 'white',
          color: 'black',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {/* Accueil */}
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/dashboard"
              onClick={handleLinkClick}
              // Met en surbrillance si la route active est "/dashboard"
              selected={location.pathname === '/dashboard'}
            >
              <ListItemIcon>
                <FontAwesomeIcon icon={faHome} style={{ color: 'black' }} />
              </ListItemIcon>
              <ListItemText
                primary="Accueil"
                primaryTypographyProps={{
                fontSize: '14px',
                }}
              />
            </ListItemButton>
          </ListItem>
          <Divider sx={{ my: 1, bgcolor: '#FFFFFF', width: '50%', mx: 'auto' }} />


          {/* Tableau de bord */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleToggleSubmenu('dashboard')}>
              <ListItemIcon>
                <FontAwesomeIcon icon={faTachometerAlt} style={{ color: 'black' }} />
              </ListItemIcon>
              <ListItemText
                primary="Tableau de bord"
                primaryTypographyProps={{
                fontSize: '14px',
                }}
              />
            </ListItemButton>
          </ListItem>
          <Collapse in={openSubmenus.dashboard} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem disablePadding>
                <ListItemButton
                  sx={{ pl: 4 }}
                  component={Link}
                  to="/dashboard/to-complete"
                  onClick={handleLinkClick}
                  selected={location.pathname === '/dashboard/to-complete'}
                >
                  <ListItemIcon>
                    <FontAwesomeIcon icon={faCheckCircle} style={{ color: '' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Commandes à compléter"
                    primaryTypographyProps={{
                    fontSize: '12px',
                    }}
                  />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  sx={{ pl: 4 }}
                  component={Link}
                  to="/dashboard/to-pay"
                  onClick={handleLinkClick}
                  selected={location.pathname === '/dashboard/to-pay'}
                >
                  <ListItemIcon>
                    <FontAwesomeIcon icon={faDollarSign} style={{ color: '' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Commandes à payer"
                    primaryTypographyProps={{
                    fontSize: '12px',
                    }}
                  />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  sx={{ pl: 4 }}
                  component={Link}
                  to="/dashboard/returned-orders"
                  onClick={handleLinkClick}
                  selected={location.pathname === '/dashboard/returned-orders'}
                >
                  <ListItemIcon>
                    <FontAwesomeIcon icon={faArrowCircleLeft} style={{ color: '' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Commandes retournées"
                    primaryTypographyProps={{
                    fontSize: '12px',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse>

          {/* Nouvelle Commande */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleToggleSubmenu('newOrder')}>
              <ListItemIcon>
                <FontAwesomeIcon icon={faShoppingCart} style={{ color: 'black' }} />
              </ListItemIcon>
              <ListItemText
                    primary="Nouvelle Commande"
                    primaryTypographyProps={{
                    fontSize: '14px',
                    }}
                  />
            </ListItemButton>
          </ListItem>
          <Collapse in={openSubmenus.newOrder} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem disablePadding>
                <ListItemButton
                  sx={{ pl: 4 }}
                  component={Link}
                  to="/dashboard/create-order"
                  onClick={handleLinkClick}
                  selected={location.pathname === '/dashboard/create-order'}
                >
                  <ListItemIcon>
                    <FontAwesomeIcon icon={faCertificate} style={{ color: '' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Certificat d'origine"
                    primaryTypographyProps={{
                    fontSize: '12px',
                    }}
                  />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  sx={{ pl: 4 }}
                  component={Link}
                  to="/dashboard/legalization"
                  onClick={handleLinkClick}
                  selected={location.pathname === '/dashboard/legalization'}
                >
                  <ListItemIcon>
                    <FontAwesomeIcon icon={faGavel} style={{ color: '' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Légalisation de commande"
                    primaryTypographyProps={{
                    fontSize: '12px',
                    }}
                  />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  sx={{ pl: 4 }}
                  component={Link}
                  to="/dashboard/commercial-invoice"
                  onClick={handleLinkClick}
                  selected={location.pathname === '/dashboard/commercial-invoice'}
                >
                  <ListItemIcon>
                    <FontAwesomeIcon icon={faFileInvoice} style={{ color: '' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Facture commercial"
                    primaryTypographyProps={{
                    fontSize: '12px',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse>

          {/* Mes commandes passées */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleToggleSubmenu('pastOrders')}>
              <ListItemIcon>
                <FontAwesomeIcon icon={faHistory} style={{ color: 'black' }} />
              </ListItemIcon>
              <ListItemText
                    primary="Mes commandes passées"
                    primaryTypographyProps={{
                    fontSize: '14px',
                    }}
                  />
            </ListItemButton>
          </ListItem>
          <Collapse in={openSubmenus.pastOrders} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem disablePadding>
                <ListItemButton
                  sx={{ pl: 4 }}
                  component={Link}
                  to="/"
                  onClick={handleLinkClick}
                  selected={location.pathname === '/'}
                >
                  <ListItemIcon>
                    <FontAwesomeIcon icon={faHistory} style={{ color: '' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={currentYear}
                    primaryTypographyProps={{
                    fontSize: '12px',
                    }}
                  />
           
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  sx={{ pl: 4 }}
                  component={Link}
                  to="/"
                  onClick={handleLinkClick}
                  selected={location.pathname === '/'}
                >
                  <ListItemIcon>
                    <FontAwesomeIcon icon={faHistory} style={{ color: '' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={previousYear}
                    primaryTypographyProps={{
                    fontSize: '12px',
                    }}
                  />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  sx={{ pl: 4 }}
                  component={Link}
                  to="/"
                  onClick={handleLinkClick}
                  selected={location.pathname === '/'}
                >
                  <ListItemIcon>
                    <FontAwesomeIcon icon={faHistory} style={{ color: '' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={`Avant ${previousYear}`}
                    primaryTypographyProps={{
                    fontSize: '12px',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse>
          <Divider sx={{ my: 1, bgcolor: '#FFFFFF', width: '50%', mx: 'auto' }} />


          {/* Mes destinataires */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleToggleSubmenu('clients')}>
              <ListItemIcon>
                <FontAwesomeIcon icon={faUsers} style={{ color: 'black' }} />
              </ListItemIcon>
              <ListItemText
                    primary="Mes destinataires"
                    primaryTypographyProps={{
                    fontSize: '14px',
                    }}
                  />
            </ListItemButton>
          </ListItem>
          <Collapse in={openSubmenus.clients} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem disablePadding>
                <ListItemButton
                  sx={{ pl: 4 }}
                  component={Link}
                  to="/dashboard/destinatairelist"
                  onClick={handleLinkClick}
                  selected={location.pathname === '/dashboard/destinatairelist'}
                >
                  <ListItemIcon>
                    <FontAwesomeIcon icon={faUsers} style={{ color: '#FFFFFF' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Liste des destinataires"
                    primaryTypographyProps={{
                    fontSize: '12px',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse>
          <Divider sx={{ my: 1, bgcolor: '#FFFFFF', width: '50%', mx: 'auto' }} />


          {/* Déconnexion */}
          <Box sx={{ marginTop: 'auto' }}>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon>
                  <FontAwesomeIcon icon={faSignOutAlt} style={{ color: 'black' }} />
                </ListItemIcon>
                <ListItemText
                    primary="Déconnexion"
                    primaryTypographyProps={{
                    fontSize: '14px',
                    }}
                  />
              </ListItemButton>
            </ListItem>
          </Box>
        </List>
      </Box>
    </Drawer>
  );
};

export default Menu;