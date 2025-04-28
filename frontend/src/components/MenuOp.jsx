import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { useMediaQuery } from '@mui/material';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
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
  faBalanceScale,
  faUserPlus,
} from '@fortawesome/free-solid-svg-icons';

const drawerWidth = 240;
const PARENT_MENUS = ['gestion', 'administration', 'myCCD'];

const selectedStyle = {
  "&.Mui-selected": {
    backgroundColor: "#DCAF26",
    color: "white",
    "&:hover": { backgroundColor: "#DCAF26 !important" },
    "& .MuiListItemText-primary": { color: "white !important" },
    "& .MuiListItemIcon-root": { color: "white !important" },
  },
};

const logoutStyle = {
  color: "red",
  "& .MuiListItemText-primary": { color: "red !important" },
  "& .MuiListItemIcon-root": { color: "red !important" },
  "&:hover": { color: "red !important", backgroundColor: "inherit" },
};

const MenuOP = ({ isMenuOpen, toggleMenu }) => {
  const [openMenu, setOpenMenu] = useState({});
  const [activeLink, setActiveLink] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width:768px)');

  const toggleSubmenu = (menu) => {
    if (PARENT_MENUS.includes(menu)) {
      setOpenMenu(prev => {
        const next = {};
        PARENT_MENUS.forEach(m => next[m] = false);
        next[menu] = !prev[menu];
        return next;
      });
    } else {
      setOpenMenu(prev => ({ ...prev, [menu]: !prev[menu] }));
    }
  };

  const handleLinkClick = (menu, link) => {
    setActiveLink(link);
    if (PARENT_MENUS.includes(menu)) {
      setOpenMenu(prev => {
        const next = {};
        PARENT_MENUS.forEach(m => next[m] = false);
        next[menu] = true;
        return next;
      });
    } else {
      setOpenMenu(prev => ({ ...prev, [menu]: true }));
    }
    if (!isDesktop) toggleMenu();
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Drawer
      variant={isDesktop ? "permanent" : "persistent"}
      anchor="left"
      open={isDesktop ? true : isMenuOpen}
      sx={{
        width: drawerWidth, flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth, boxSizing: "border-box",
          backgroundColor: "white", color: "black",
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
              onClick={() => handleLinkClick('dashboardoperateur','dashboardoperateur')}
              selected={activeLink==='dashboardoperateur'}
              sx={selectedStyle}
            >
              <ListItemIcon><FontAwesomeIcon icon={faUserTie} /></ListItemIcon>
              <ListItemText primary="Tableau de bord" primaryTypographyProps={{ fontSize:"14px" }} />
            </ListItemButton>
          </ListItem>
          <Divider sx={{ my:1, bgcolor:"#FFF", width:"50%", mx:"auto" }}/>

          {/* Gestion des commandes */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => toggleSubmenu('gestion')} sx={{ cursor:'pointer' }}>
              <ListItemIcon><FontAwesomeIcon icon={faShoppingCart} /></ListItemIcon>
              <ListItemText primary="Gestion des commandes" primaryTypographyProps={{ fontSize:"14px" }} />
            </ListItemButton>
          </ListItem>
          <Collapse in={openMenu.gestion} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem disablePadding>
                <ListItemButton
                  component={Link} to="/dashboard/operator"
                  onClick={() => handleLinkClick('gestion','home')}
                  selected={activeLink==='home'}
                  sx={{ pl:4, ...selectedStyle }}
                >
                  <ListItemIcon><FontAwesomeIcon icon={faShoppingCart} /></ListItemIcon>
                  <ListItemText primary="Commandes à traiter" primaryTypographyProps={{ fontSize:"12px"}}/>
                </ListItemButton>
              </ListItem>
             
              <ListItem disablePadding>
                <ListItemButton
                  component={Link} to="/dashboard/operator/search-orders"
                  onClick={() => handleLinkClick('gestion','searchOrders')}
                  selected={activeLink==='searchOrders'}
                  sx={{ pl:4, ...selectedStyle }}
                >
                  <ListItemIcon><FontAwesomeIcon icon={faHistory} /></ListItemIcon>
                  <ListItemText primary="Historique des commandes terminées" primaryTypographyProps={{ fontSize:"12px"}}/>
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse>
          <Divider sx={{ my:1, bgcolor:"#FFF", width:"50%", mx:"auto" }}/>

          {/* Administration */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => toggleSubmenu('administration')} sx={{ cursor:'pointer' }}>
              <ListItemIcon><FontAwesomeIcon icon={faCog} /></ListItemIcon>
              <ListItemText primary="Administration" primaryTypographyProps={{ fontSize:"14px" }} />
            </ListItemButton>
          </ListItem>
          <Collapse in={openMenu.administration} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {/* Clients */}
              <ListItem disablePadding>
                <ListItemButton onClick={() => toggleSubmenu('clients')} sx={{ pl:4, cursor:'pointer' }}>
                  <ListItemIcon><FontAwesomeIcon icon={faUsers} /></ListItemIcon>
                  <ListItemText primary="Clients" primaryTypographyProps={{ fontSize:"12px" }} />
                </ListItemButton>
              </ListItem>
              <Collapse in={openMenu.clients} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link} to="/dashboard/operator/inscriptions"
                      onClick={() => handleLinkClick('clients','inscriptions')}
                      selected={activeLink==='inscriptions'}
                      sx={{ pl:6, ...selectedStyle }}
                    >
                      <ListItemIcon><FontAwesomeIcon icon={faUserPlus} /></ListItemIcon>
                      <ListItemText primary="Nouvelles inscriptions" primaryTypographyProps={{ fontSize:"12px"}}/>
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link} to="/dashboard/operator/clientvalides"
                      onClick={() => handleLinkClick('clients','clientsvalides')}
                      selected={activeLink==='clientsvalides'}
                      sx={{ pl:6, ...selectedStyle }}
                    >
                      <ListItemIcon><FontAwesomeIcon icon={faUsers} /></ListItemIcon>
                      <ListItemText primary="Listing Clients" primaryTypographyProps={{ fontSize:"12px"}}/>
                    </ListItemButton>
                  </ListItem>
                </List>
              </Collapse>

              {/* Opérateurs (lien direct) */}
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  to="/dashboard/operator/operatorslist"
                  onClick={() => handleLinkClick('administration','operatorslist')}
                  selected={activeLink==='operatorslist'}
                  sx={{ pl:4, ...selectedStyle }}
                >
                  <ListItemIcon><FontAwesomeIcon icon={faUserTie} /></ListItemIcon>
                  <ListItemText primary="Opérateurs" primaryTypographyProps={{ fontSize:"12px" }} />
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse>
          <Divider sx={{ my:1, bgcolor:"#FFF", width:"50%", mx:"auto" }}/>

          {/* Ma CCD */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => toggleSubmenu('myCCD')} sx={{ cursor:'pointer' }}>
              <ListItemIcon><FontAwesomeIcon icon={faBuilding} /></ListItemIcon>
              <ListItemText primary="Ma CCD" primaryTypographyProps={{ fontSize:"14px" }} />
            </ListItemButton>
          </ListItem>
          <Collapse in={openMenu.myCCD} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {/* CGV */}
              <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/dashboard/operator/cgv"
                onClick={() => handleLinkClick('myCCD','cgv')}
                selected={activeLink==='cgv'}
                sx={{ pl:4, ...selectedStyle }}
              >
                  <ListItemIcon><FontAwesomeIcon icon={faFileContract} /></ListItemIcon>
                  <ListItemText primary="Les C.G.V" primaryTypographyProps={{ fontSize:"12px"}}/>
                </ListItemButton>
              </ListItem>
              {/* Prestations de services */}
              <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/dashboard/operator/prestation-service"
                onClick={() => handleLinkClick('myCCD','prestation')}
                selected={activeLink==='prestation'}
                sx={{ pl:4, ...selectedStyle }}
              >
                  <ListItemIcon><FontAwesomeIcon icon={faHandshake} /></ListItemIcon>
                  <ListItemText primary="Prestations de services" primaryTypographyProps={{ fontSize:"12px"}}/>
                </ListItemButton>
              </ListItem>
              {/* Mention légale */}
              <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/dashboard/operator/mentions-legales"
                onClick={() => handleLinkClick('myCCD','mentionLegale')}
                selected={activeLink==='mentionLegale'}
                sx={{ pl:4, ...selectedStyle }}
              >
                  <ListItemIcon><FontAwesomeIcon icon={faBalanceScale} /></ListItemIcon>
                  <ListItemText primary="Mention légale" primaryTypographyProps={{ fontSize:"12px"}}/>
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse>
          <Divider sx={{ my:1, bgcolor:"#FFF", width:"50%", mx:"auto" }}/>

          {/* Déconnexion */}
          <Box sx={{ marginTop:'auto' }}>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout} sx={logoutStyle}>
                <ListItemIcon><FontAwesomeIcon icon={faSignOutAlt} /></ListItemIcon>
                <ListItemText primary="Se déconnecter" primaryTypographyProps={{ fontSize:"14px"}}/>
              </ListItemButton>
            </ListItem>
          </Box>
        </List>
      </Box>
    </Drawer>
  );
};

export default MenuOP;
