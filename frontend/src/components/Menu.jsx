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
  const [openOrders, setOpenOrders] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();                   // on récupère tout
  const { pathname, search } = location;
  const tabParam = new URLSearchParams(search).get("tab");

  // Auto‐open the submenu when landing on /dashboard/home?tab=…
  useEffect(() => {
    if (pathname === "/home" && tabParam !== null) {
      setOpenOrders(true);
    }
  }, [pathname, tabParam]);

  const handleToggleOrders = () => {
    setOpenOrders(o => !o);
  };



  // Ouvrir automatiquement certains sous-menus selon l'URL courante
  useEffect(() => {

    // --- 0) Ma CCD ---
    if (
      location.pathname === "/cgv" ||
      location.pathname === "/prestation-service" ||
      location.pathname === "/mentions-legales"
    ) {
      setOpenSubmenus({ newOrder: false, orders: false, ccd: true });
      return;
    }
    // 1) Gestion des commandes → ouvre le sous-menu orders
    if (
      location.pathname === "/home" ||
      location.pathname === "/search-orders"
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
      location.pathname.startsWith("/create-order") ||
      location.pathname.startsWith("/legalization") ||
      location.pathname.startsWith("/commercial-invoice")
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
    if (location.pathname.startsWith("/destinatairelist")) {
      setOpenSubmenus({
        newOrder: false,
        orders: false,
        clients: true,
        contacts: false,
      });
      return;
    }

    // 4) Contacts (si vous en avez un autre)
    if (location.pathname.startsWith("/contactslist")) {
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
              to="/dashboardclient"
              onClick={() => {
                handleParentClick();
                handleLinkClick();
              }}
              selected={location.pathname === "/dashboardclient"}
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
              to="/notifications?all=true"
              onClick={() => {
                handleParentClick();
                handleLinkClick();
              }}
              selected={location.pathname.startsWith("/notifications")}
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
          {/* Gestion des commandes (parent header) */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                handleToggleOrders();
                navigate("/home?tab=0");
                handleLinkClick();
              }}
              sx={selectedStyle}
            >
              <ListItemIcon><FontAwesomeIcon icon={faClipboardList} /></ListItemIcon>
              <ListItemText primary="Gestion des commandes" primaryTypographyProps={{ fontSize: "14px" }} />
            </ListItemButton>
          </ListItem>

          {/* Gestion des commandes (submenu) */}
          <Collapse in={openOrders} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>

              {/* 0) Commande à soumettre */}
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  to="/home?tab=0"
                  selected={pathname === "/home" && tabParam === "0"}
                  sx={{ pl: 4, ...selectedStyle }}
                  onClick={handleLinkClick}
                >
                  <ListItemIcon><FontAwesomeIcon icon={faShoppingCart} /></ListItemIcon>
                  <ListItemText primary="Commande à soumettre" primaryTypographyProps={{ fontSize: "12px" }} />
                </ListItemButton>
              </ListItem>

              {/* 1) En attente de la CCD */}
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  to="/home?tab=1"
                  selected={pathname === "/home" && tabParam === "1"}
                  sx={{ pl: 4, ...selectedStyle }}
                  onClick={handleLinkClick}
                >
                  <ListItemIcon><FontAwesomeIcon icon={faLandmark} /></ListItemIcon>
                  <ListItemText primary="En attente de la CCD" primaryTypographyProps={{ fontSize: "12px" }} />
                </ListItemButton>
              </ListItem>

              {/* 2) En attente de paiement */}
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  to="/home?tab=2"
                  selected={pathname === "/home" && tabParam === "2"}
                  sx={{ pl: 4, ...selectedStyle }}
                  onClick={handleLinkClick}
                >
                  <ListItemIcon><FontAwesomeIcon icon={faDollarSign} /></ListItemIcon>
                  <ListItemText primary="En attente de paiement" primaryTypographyProps={{ fontSize: "12px" }} />
                </ListItemButton>
              </ListItem>

              {/* 3) Retournées par la CCD */}
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  to="/home?tab=3"
                  selected={pathname === "/home" && tabParam === "3"}
                  sx={{ pl: 4, ...selectedStyle }}
                  onClick={handleLinkClick}
                >
                  <ListItemIcon><FontAwesomeIcon icon={faArrowCircleLeft} /></ListItemIcon>
                  <ListItemText primary="Retournées par la CCD" primaryTypographyProps={{ fontSize: "12px" }} />
                </ListItemButton>
              </ListItem>

              {/* Historique */}
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  to="/search-orders"
                  selected={pathname === "/search-orders"}
                  sx={{ pl: 4, ...selectedStyle }}
                  onClick={handleLinkClick}
                >
                  <ListItemIcon><FontAwesomeIcon icon={faHistory} /></ListItemIcon>
                  <ListItemText primary="Historique des commandes terminées" primaryTypographyProps={{ fontSize: "12px" }} />
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
                  to="/create-order"
                  onClick={handleLinkClick}
                  selected={location.pathname === "/create-order"}
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
                  to="/commercial-invoice"
                  onClick={handleLinkClick}
                  selected={location.pathname === "/commercial-invoice"}
                >
                  <ListItemIcon sx={{ color: "black" }}>
                    <FontAwesomeIcon icon={faFileInvoice} />
                  </ListItemIcon>
                  <ListItemText primary="Visa Facture commercial" primaryTypographyProps={{ fontSize: "12px" }} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  sx={{ pl: 4, ...selectedStyle }}
                  component={Link}
                  to="/legalization"
                  onClick={handleLinkClick}
                  selected={location.pathname === "/legalization"}
                >
                  <ListItemIcon sx={{ color: "black" }}>
                    <FontAwesomeIcon icon={faGavel} />
                  </ListItemIcon>
                  <ListItemText primary="Légalisation de commande" primaryTypographyProps={{ fontSize: "12px" }} />
                </ListItemButton>
              </ListItem>

            </List>
          </Collapse>


          <Divider sx={{ my: 1, bgcolor: "#FFFFFF", width: "50%", mx: "auto" }} />

          {/* Mes destinataires (lien direct) */}
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/destinatairelist"
              onClick={() => {
                closeAllSubmenus();
                handleLinkClick();
              }}
              selected={location.pathname === "/destinatairelist"}
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

          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/masociete"
              onClick={() => {
                handleParentClick();
                handleLinkClick();
              }}
              selected={location.pathname === "/masociete"}
              sx={selectedStyle}
            >
              <ListItemIcon sx={{ color: "black" }}>
                <FontAwesomeIcon icon={faCheckCircle} />
              </ListItemIcon>
              <ListItemText primary="Ma société" primaryTypographyProps={{ fontSize: "14px" }} />
            </ListItemButton>
          </ListItem>



          {/* Mes contacts (lien direct) */}
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/contactslist"
              onClick={() => {
                closeAllSubmenus();
                handleLinkClick();
              }}
              selected={location.pathname === "/contactslist"}
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


          {/* Lien vers la page Contactez-nous */}
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/contact-us"
              onClick={() => {
                closeAllSubmenus();
                handleLinkClick();
              }}
              selected={location.pathname === "/contact-us"}
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
