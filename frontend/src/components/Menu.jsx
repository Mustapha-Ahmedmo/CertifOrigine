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

import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList, // Pour "Gestion des commandes"
  faTachometerAlt,
  faCheckCircle,
  faBell,
  faDollarSign,
  faArrowCircleLeft,
  faShoppingCart,
  faCertificate,
  faGavel,
  faFileInvoice,
  faHistory,
  faUsers,
  faSignOutAlt,
  faLandmark,
  faEnvelope,
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

// en haut du fichier Menu.jsx
const newOrderStyle = {
  color: "#DCAF26",               // texte
  "& .MuiListItemIcon-root": {
    color: "#DCAF26",             // icône
  },
};


const Menu = ({ isMenuOpen, toggleMenu }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // En mode desktop, le menu sera toujours affiché
  // Ainsi, pour le Drawer, on force open à true si isDesktop est vrai.

  // Initialisation des sous-menus
  const [openSubmenus, setOpenSubmenus] = useState({
    newOrder: false,
    orders: false,
    ccd: false,      
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Ouvrir automatiquement certains sous-menus selon l'URL courante
  useEffect(() => {

     // --- 0) Ma CCD ---
    if (
      location.pathname === "/dashboard/cgv" ||
      location.pathname === "/dashboard/prestation-service" ||
      location.pathname === "/dashboard/mentions-legales"
    ) {
      setOpenSubmenus({ newOrder: false, orders: false, ccd: true });
      return;
    }
    // 1) Gestion des commandes → ouvre le sous-menu orders
    if (
      location.pathname === "/dashboard/home" ||
      location.pathname === "/dashboard/search-orders"
    ) {
      setOpenSubmenus({
        newOrder: false,
        orders: true,
        clients: false,
        contacts: false,
      });
      return; // on sort, rien d'autre n'est évalué
    }
  
    // 2) Nouvelle Commande → votre ancien bloc
    if (
      location.pathname.startsWith("/dashboard/create-order") ||
      location.pathname.startsWith("/dashboard/legalization") ||
      location.pathname.startsWith("/dashboard/commercial-invoice")
    ) {
      setOpenSubmenus({
        newOrder: true,
        orders: false,
        clients: false,
        contacts: false,
      });
      return;
    }
  
    // 3) Destinataires
    if (location.pathname.startsWith("/dashboard/destinatairelist")) {
      setOpenSubmenus({
        newOrder: false,
        orders: false,
        clients: true,
        contacts: false,
      });
      return;
    }
  
    // 4) Contacts (si vous en avez un autre)
    if (location.pathname.startsWith("/dashboard/contactslist")) {
      setOpenSubmenus({
        newOrder: false,
        orders: false,
        clients: false,
        contacts: true,
      });
      return;
    }
  
    // 5) Sinon, on ferme tout
    setOpenSubmenus({
      newOrder: false,
      orders: false,
      clients: false,
      contacts: false,
    });
  }, [location]);
  

  // Pour les menus qui ouvrent des sous-menus, on ferme les autres
  const handleToggleSubmenu = (menu) => {
    setOpenSubmenus(prev => ({
      newOrder: false,
      orders: false,
      ccd: false,
      [menu]: !prev[menu],
    }));
  };
  


  // Fermer tous les sous-menus
  const closeAllSubmenus = () => {
    setOpenSubmenus({
      newOrder: false,
      orders: false,
      ccd: false
    });
  };

  // Pour les parents sans sous-menu, fermer tous les sous-menus et, en mobile, fermer le menu
  const handleParentClick = () => {
    closeAllSubmenus();
    if (!isDesktop) {
      toggleMenu();
    }
  };

  // Fermer le menu en mobile après un clic
  const handleLinkClick = () => {
    if (!isDesktop) {
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
      variant={isDesktop ? "persistent" : "temporary"}
      anchor="left"
      open={isDesktop ? true : isMenuOpen}
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
          {/* Lien vers Tableau de bord (DashboardClient) */}
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/dashboard/dashboardclient"
              onClick={() => {
                handleParentClick();
                handleLinkClick();
              }}
              selected={location.pathname === "/dashboard/dashboardclient"}
              sx={selectedStyle}
            >
              <ListItemIcon sx={{ color: "black" }}>
                <FontAwesomeIcon icon={faTachometerAlt} />
              </ListItemIcon>
              <ListItemText primary="Tableau de bord" primaryTypographyProps={{ fontSize: "14px" }} />
            </ListItemButton>
          </ListItem>

          {/* NEW: Mes Notifications menu item */}
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/dashboard/notifications?all=true"
              onClick={() => {
                handleParentClick();
                handleLinkClick();
              }}
              selected={location.pathname.startsWith("/dashboard/notifications")}
              sx={selectedStyle}
            >
              <ListItemIcon sx={{ color: "black" }}>
                <FontAwesomeIcon icon={faBell} />
              </ListItemIcon>
              <ListItemText primary="Mes Notifications" primaryTypographyProps={{ fontSize: "14px" }} />
            </ListItemButton>
          </ListItem>

          <Divider sx={{ my: 1, bgcolor: "#FFFFFF", width: "50%", mx: "auto" }} />



          {/* Gestion des commandes en tant que menu parent */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleToggleSubmenu("orders")}
              selected={false}  // on gère la sélection sur les enfants
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
          <Collapse in={openSubmenus.orders} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {/* Commandes en cours */}
              <ListItem disablePadding>
                <ListItemButton
                  sx={{ pl: 4, ...selectedStyle }}
                  component={Link}
                  to="/dashboard/home"
                  onClick={() => {
                    handleParentClick();
                    handleLinkClick();
                  }}
                  selected={location.pathname === "/dashboard/home"}
                >
                  <ListItemIcon sx={{ color: "black" }}>
                    <FontAwesomeIcon icon={faClipboardList} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Commandes en cours"
                    primaryTypographyProps={{ fontSize: "12px" }}
                  />
                </ListItemButton>
              </ListItem>
              {/* Historique des commandes */}
              <ListItem disablePadding>
                <ListItemButton
                  sx={{ pl: 4, ...selectedStyle }}
                  component={Link}
                  to="/dashboard/search-orders"
                  onClick={() => {
                    handleParentClick();
                    handleLinkClick();
                  }}
                  selected={location.pathname === "/dashboard/search-orders"}
                >
                  <ListItemIcon sx={{ color: "black" }}>
                    <FontAwesomeIcon icon={faHistory} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Historique des commandes terminées"
                    primaryTypographyProps={{ fontSize: "12px" }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse>
          


          {/* Nouvelle Commande (sous-menu) */}
          <ListItem disablePadding>
          <ListItemButton
              onClick={() => handleToggleSubmenu("newOrder")}
              selected={false}
              sx={newOrderStyle}
            >
              <ListItemIcon sx={{ color: "black" }}>
                <FontAwesomeIcon icon={faShoppingCart} />
              </ListItemIcon>
              <ListItemText primary="Nouvelle Commande" primaryTypographyProps={{ fontSize: "14px" }} />
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
                  <ListItemText primary="Certificat d'origine" primaryTypographyProps={{ fontSize: "12px" }} />
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
                  <ListItemText primary="Légalisation de commande" primaryTypographyProps={{ fontSize: "12px" }} />
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
                  <ListItemText primary="Facture commercial" primaryTypographyProps={{ fontSize: "12px" }} />
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse>


          <Divider sx={{ my: 1, bgcolor: "#FFFFFF", width: "50%", mx: "auto" }} />

          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/dashboard/masociete"
              onClick={() => {
                handleParentClick();
                handleLinkClick();
              }}
              selected={location.pathname === "/dashboard/masociete"}
              sx={selectedStyle}
            >
              <ListItemIcon sx={{ color: "black" }}>
                <FontAwesomeIcon icon={faCheckCircle} />
              </ListItemIcon>
              <ListItemText primary="Ma société" primaryTypographyProps={{ fontSize: "14px" }} />
            </ListItemButton>
          </ListItem>

          {/* Mes destinataires (lien direct) */}
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/dashboard/destinatairelist"
              onClick={() => {
                closeAllSubmenus();
                handleLinkClick();
              }}
              selected={location.pathname === "/dashboard/destinatairelist"}
              sx={selectedStyle}
            >
              <ListItemIcon sx={{ color: "black" }}>
                <FontAwesomeIcon icon={faUsers} />
              </ListItemIcon>
              <ListItemText
                primary="Mes destinataires"
                primaryTypographyProps={{ fontSize: "14px" }}
              />
            </ListItemButton>
          </ListItem>

          {/* Mes contacts (lien direct) */}
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/dashboard/contactslist"
              onClick={() => {
                closeAllSubmenus();
                handleLinkClick();
              }}
              selected={location.pathname === "/dashboard/contactslist"}
              sx={selectedStyle}
            >
              <ListItemIcon sx={{ color: "black" }}>
                <FontAwesomeIcon icon={faUsers} />
              </ListItemIcon>
              <ListItemText
                primary="Mes contacts"
                primaryTypographyProps={{ fontSize: "14px" }}
              />
            </ListItemButton>
          </ListItem>

          <Divider sx={{ my: 1, bgcolor: "#FFFFFF", width: "50%", mx: "auto" }} />

          {/* Ma CCD (menu parent) */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleToggleSubmenu("ccd")}
              selected={false}  // on surlignera les sous-items, pas le parent
            >
              <ListItemIcon sx={{ color: "black" }}>
                <FontAwesomeIcon icon={faLandmark} />
              </ListItemIcon>
              <ListItemText
                primary="Ma CCD"
                primaryTypographyProps={{ fontSize: "14px" }}
              />
            </ListItemButton>
          </ListItem>
          <Collapse in={openSubmenus.ccd} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {/* C.G.V */}
              <ListItem disablePadding>
                <ListItemButton
                  sx={{ pl: 4, ...selectedStyle }}
                  component={Link}
                  to="/dashboard/cgv"
                  onClick={() => { closeAllSubmenus(); handleLinkClick(); }}
                  selected={location.pathname === "/dashboard/cgv"}
                >
                  <ListItemIcon sx={{ color: "black" }}>
                    <FontAwesomeIcon icon={faCertificate} />
                  </ListItemIcon>
                  <ListItemText
                    primary="C.G.V"
                    primaryTypographyProps={{ fontSize: "12px" }}
                  />
                </ListItemButton>
              </ListItem>
              {/* Prestation de services */}
              <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/dashboard/prestation-service"
                sx={{ pl: 4, ...selectedStyle }}
                onClick={() => {
                  // toggleMenu() ferme le drawer *seulement* sur mobile
                  handleLinkClick();
                  // on n'appelle PLUS closeAllSubmenus ici, pour garder Ma CCD ouverte
                }}
                selected={location.pathname === "/dashboard/prestation-service"}
              >
                  <ListItemIcon sx={{ color: "black" }}>
                    <FontAwesomeIcon icon={faDollarSign} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Prestation de services"
                    primaryTypographyProps={{ fontSize: "12px" }}
                  />
                </ListItemButton>
              </ListItem>
              {/* Mentions légales */}
              <ListItem disablePadding>
                <ListItemButton
                  sx={{ pl: 4, ...selectedStyle }}
                  component={Link}
                  to="/dashboard/mentions-legales"
                  onClick={() => { closeAllSubmenus(); handleLinkClick(); }}
                  selected={location.pathname === "/dashboard/mentions-legales"}
                >
                  <ListItemIcon sx={{ color: "black" }}>
                    <FontAwesomeIcon icon={faGavel} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Mentions légales"
                    primaryTypographyProps={{ fontSize: "12px" }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse>

          <Divider sx={{ my: 1, bgcolor: "#FFFFFF", width: "50%", mx: "auto" }} />

          {/* Lien vers la page Contactez-nous */}
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/dashboard/contact-us"
              onClick={() => {
                closeAllSubmenus();
                handleLinkClick();
              }}
              selected={location.pathname === "/dashboard/contact-us"}
              sx={selectedStyle}
            >
              <ListItemIcon sx={{ color: "black" }}>
                <FontAwesomeIcon icon={faEnvelope} />
              </ListItemIcon>
              <ListItemText
                primary="Contactez-nous"
                primaryTypographyProps={{ fontSize: "14px" }}
              />
            </ListItemButton>
          </ListItem>

          <Divider sx={{ my: 1, bgcolor: "#FFFFFF", width: "50%", mx: "auto" }} />

          {/* Bouton de déconnexion */}
          <Box sx={{ marginTop: "auto" }}>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout} sx={logoutStyle}>
                <ListItemIcon sx={{ color: "inherit" }}>
                  <FontAwesomeIcon icon={faSignOutAlt} />
                </ListItemIcon>
                <ListItemText primary="Déconnexion" primaryTypographyProps={{ fontSize: "14px" }} />
              </ListItemButton>
            </ListItem>
          </Box>
        </List>
      </Box>
    </Drawer >
  );
};

export default Menu;
