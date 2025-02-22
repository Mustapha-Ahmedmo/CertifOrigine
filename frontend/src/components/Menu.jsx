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
  faClipboardList, // Pour "Gestion des commandes"
  faCheckCircle,
  faDollarSign,
  faArrowCircleLeft,
  faShoppingCart,
  faCertificate,
  faGavel,
  faFileInvoice,
  faHistory,
  faUsers,
  faSignOutAlt,
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

const Menu = ({ isMenuOpen, toggleMenu }) => {
  const [openSubmenus, setOpenSubmenus] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Ouvrir automatiquement certains sous-menus selon l'URL courante
  useEffect(() => {
    // Sous-pages de "Nouvelle Commande"
    if (
      location.pathname.startsWith("/dashboard/create-order") ||
      location.pathname.startsWith("/dashboard/legalization") ||
      location.pathname.startsWith("/dashboard/commercial-invoice")
    ) {
      setOpenSubmenus((prev) => ({ ...prev, newOrder: true }));
    }

    // Sous-pages de "Mes commandes passées"
    if (location.pathname === "/") {
      setOpenSubmenus((prev) => ({ ...prev, pastOrders: true }));
    }

    // Sous-page "Mes destinataires"
    if (location.pathname.startsWith("/dashboard/destinatairelist")) {
      setOpenSubmenus((prev) => ({ ...prev, clients: true }));
    }
  }, [location]);

  const handleToggleSubmenu = (menu) => {
    setOpenSubmenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  // Fermer le menu sur mobile après un clic
  const handleLinkClick = () => {
    if (window.innerWidth <= 768) {
      toggleMenu();
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
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
          {/* Gestion des commandes (anciennement "Accueil") */}
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/dashboard"
              onClick={handleLinkClick}
              // Surligné uniquement quand l'URL est exactement "/dashboard"
              selected={location.pathname === "/dashboard"}
              sx={selectedStyle}
            >
              <ListItemIcon sx={{ color: "black" }}>
                <FontAwesomeIcon icon={faClipboardList} />
              </ListItemIcon>
              <ListItemText
                primary="Gestion des commandes"
                primaryTypographyProps={{ fontSize: "14px" }}
              />
            </ListItemButton>
          </ListItem>
          <Divider sx={{ my: 1, bgcolor: "#FFFFFF", width: "50%", mx: "auto" }} />

          {/* Nouvelle Commande */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleToggleSubmenu("newOrder")}
              // Pas de surbrillance pour le parent car il n'y a pas de page associée
              selected={false}
            >
              <ListItemIcon sx={{ color: "black" }}>
                <FontAwesomeIcon icon={faShoppingCart} />
              </ListItemIcon>
              <ListItemText
                primary="Nouvelle Commande"
                primaryTypographyProps={{ fontSize: "14px" }}
              />
            </ListItemButton>
          </ListItem>
          <Collapse in={openSubmenus.newOrder} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem disablePadding>
                <ListItemButton
                  sx={{ pl: 4, ...selectedStyle }}
                  component={Link}
                  to="/dashboard/create-order"
                  onClick={handleLinkClick}
                  selected={location.pathname === "/dashboard/create-order"}
                >
                  <ListItemIcon sx={{ color: "black" }}>
                    <FontAwesomeIcon icon={faCertificate} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Certificat d'origine"
                    primaryTypographyProps={{ fontSize: "12px" }}
                  />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  sx={{ pl: 4, ...selectedStyle }}
                  component={Link}
                  to="/dashboard/legalization"
                  onClick={handleLinkClick}
                  selected={location.pathname === "/dashboard/legalization"}
                >
                  <ListItemIcon sx={{ color: "black" }}>
                    <FontAwesomeIcon icon={faGavel} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Légalisation de commande"
                    primaryTypographyProps={{ fontSize: "12px" }}
                  />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  sx={{ pl: 4, ...selectedStyle }}
                  component={Link}
                  to="/dashboard/commercial-invoice"
                  onClick={handleLinkClick}
                  selected={location.pathname === "/dashboard/commercial-invoice"}
                >
                  <ListItemIcon sx={{ color: "black" }}>
                    <FontAwesomeIcon icon={faFileInvoice} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Facture commercial"
                    primaryTypographyProps={{ fontSize: "12px" }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse>

          {/* Mes commandes passées */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleToggleSubmenu("pastOrders")}
              selected={location.pathname === "/"}
            >
              <ListItemIcon sx={{ color: "black" }}>
                <FontAwesomeIcon icon={faHistory} />
              </ListItemIcon>
              <ListItemText
                primary="Mes commandes passées"
                primaryTypographyProps={{ fontSize: "14px" }}
              />
            </ListItemButton>
          </ListItem>
          <Collapse in={openSubmenus.pastOrders} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem disablePadding>
                <ListItemButton
                  sx={{ pl: 4, ...selectedStyle }}
                  component={Link}
                  to="/"
                  onClick={handleLinkClick}
                  selected={location.pathname === "/"}
                >
                  <ListItemIcon sx={{ color: "black" }}>
                    <FontAwesomeIcon icon={faHistory} />
                  </ListItemIcon>
                  <ListItemText
                    primary={currentYear}
                    primaryTypographyProps={{ fontSize: "12px" }}
                  />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  sx={{ pl: 4, ...selectedStyle }}
                  component={Link}
                  to="/"
                  onClick={handleLinkClick}
                  selected={location.pathname === "/"}
                >
                  <ListItemIcon sx={{ color: "black" }}>
                    <FontAwesomeIcon icon={faHistory} />
                  </ListItemIcon>
                  <ListItemText
                    primary={previousYear}
                    primaryTypographyProps={{ fontSize: "12px" }}
                  />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  sx={{ pl: 4, ...selectedStyle }}
                  component={Link}
                  to="/"
                  onClick={handleLinkClick}
                  selected={location.pathname === "/"}
                >
                  <ListItemIcon sx={{ color: "black" }}>
                    <FontAwesomeIcon icon={faHistory} />
                  </ListItemIcon>
                  <ListItemText
                    primary={`Avant ${previousYear}`}
                    primaryTypographyProps={{ fontSize: "12px" }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse>
          <Divider sx={{ my: 1, bgcolor: "#FFFFFF", width: "50%", mx: "auto" }} />

          {/* Mes destinataires */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleToggleSubmenu("clients")}>
              <ListItemIcon sx={{ color: "black" }}>
                <FontAwesomeIcon icon={faUsers} />
              </ListItemIcon>
              <ListItemText
                primary="Mes destinataires"
                primaryTypographyProps={{ fontSize: "14px" }}
              />
            </ListItemButton>
          </ListItem>
          <Collapse in={openSubmenus.clients} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem disablePadding>
                <ListItemButton
                  sx={{ pl: 4, ...selectedStyle }}
                  component={Link}
                  to="/dashboard/destinatairelist"
                  onClick={handleLinkClick}
                  selected={location.pathname === "/dashboard/destinatairelist"}
                >
                  <ListItemIcon sx={{ color: "black" }}>
                    <FontAwesomeIcon icon={faUsers} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Liste des destinataires"
                    primaryTypographyProps={{ fontSize: "12px" }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse>
          <Divider sx={{ my: 1, bgcolor: "#FFFFFF", width: "50%", mx: "auto" }} />

          {/* Déconnexion */}
          <Box sx={{ marginTop: "auto" }}>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout} sx={logoutStyle}>
                <ListItemIcon sx={{ color: "inherit" }}>
                  <FontAwesomeIcon icon={faSignOutAlt} />
                </ListItemIcon>
                <ListItemText
                  primary="Déconnexion"
                  primaryTypographyProps={{ fontSize: "14px" }}
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
