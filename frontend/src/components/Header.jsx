import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Avatar from '@mui/material/Avatar';
import Switch from '@mui/material/Switch';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Badge from '@mui/material/Badge';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faShoppingCart,
  faBars,
  faTimes,
  faUser,
} from '@fortawesome/free-solid-svg-icons';

import logo from '../assets/logo.jpg';
import './Header.css';
import { useSelector } from 'react-redux';
import { getMemo, getOrderStaticsByServices } from '../services/apiServices';

const Header = ({ toggleMenu, isMenuOpen }) => {
  const { t, i18n } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [languageSwitch, setLanguageSwitch] = useState(i18n.language === 'fr');
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [cartItemCount, setCartItemCount] = useState(0);

  const user = useSelector((state) => state.auth.user);
  const idLogin = user?.id_login_user;
  const custAccountId = user?.id_cust_account;

  // Instead of a fake 3, fetch the cart item count using order statistics
  useEffect(() => {
    const fetchCartCount = async () => {
      if (custAccountId) {
        // Adjust the parameters as needed. Here we pass:
        // - p_date_start and p_date_end as null (i.e. no date filter)
        // - p_id_list_order as null (all orders)
        // - p_id_custaccount as a string (since you expect that)
        // - p_id_list_orderstatus as a comma-separated string (example: "1,2,3,4,6,7")
        const params = {
          p_date_start: null,
          p_date_end: null,
          p_id_list_order: null,
          p_id_custaccount: custAccountId,
          p_id_list_orderstatus: '1,2,3,4,6,7'
        };

        try {
          const result = await getOrderStaticsByServices(params);
          if (result && result.data && result.data.length > 0) {
            const data = result.data[0];
            // For example, sum all three counts
            const total = Number(data.count_ord_certif_ori) +
                          Number(data.count_ord_legalization) +
                          Number(data.count_ord_com_invoice);
            setCartItemCount(total);
          }
        } catch (error) {
          console.error('Error fetching order statistics:', error);
        }
      }
    };

    fetchCartCount();
  }, [custAccountId]);

  // For memos (notifications)
  useEffect(() => {
    const fetchMemos = async () => {
      if (custAccountId) {
        const params = {
          p_isAck: 'false',
          p_id_cust_account: custAccountId,
          p_isopuser: 'false',
        };
        try {
          const result = await getMemo(params);
          if (result && result.data) {
            setNotificationsCount(result.data.length);
          }
        } catch (error) {
          console.error('Error fetching memos:', error);
        }
      }
    };
    fetchMemos();
  }, [custAccountId]);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLanguageChange = (event) => {
    const isFr = event.target.checked;
    setLanguageSwitch(isFr);
    i18n.changeLanguage(isFr ? 'fr' : 'en');
  };

  return (
    <header className="header">
      <div
        className="mobile-menu-button"
        onClick={toggleMenu}
        aria-label="Toggle menu"
        role="button"
        tabIndex="0"
        onKeyDown={(e) => {
          if (e.key === 'Enter') toggleMenu();
        }}
      >
        <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} style={{ fontSize: '1rem' }} />
      </div>

      <div className="logo-container">
        <img src={logo} alt="Chambre de Commerce de Djibouti" className="logo" />
      </div>

      <div className="header-right">
        {/* Notifications */}
        <Box className="header-icon-container" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Link to="/dashboard/notifications">
            <Badge badgeContent={notificationsCount} color="error" anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
              <FontAwesomeIcon icon={faBell} style={{ fontSize: '1rem' }} />
            </Badge>
          </Link>
          <Typography variant="caption" className="icon-label">
            Notifications
          </Typography>
        </Box>

        {/* Cart (using order statistics) */}
        <Box className="header-icon-container" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Badge badgeContent={cartItemCount} color="error" anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
            <FontAwesomeIcon icon={faShoppingCart} style={{ fontSize: '1rem' }} />
          </Badge>
          <Typography variant="caption" className="icon-label">
            Panier
          </Typography>
        </Box>

        {/* Profile */}
        <Box className="header-icon-container" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          <Avatar className="header-avatar" onClick={toggleDropdown} sx={{ width: 32, height: 32, backgroundColor: '#DDAF26' }}>
            <FontAwesomeIcon icon={faUser} style={{ color: 'white', fontSize: '1rem' }} />
          </Avatar>
          {dropdownOpen && (
            <Box className="dropdown" sx={{
              position: 'absolute',
              top: '100%',
              right: 0,
              backgroundColor: 'white',
              boxShadow: 3,
              p: 1,
              mt: 1,
              zIndex: 1000,
            }}>
              <Link to="/profile">{t('header.profile')}</Link>
              <Link to="/settings">{t('header.settings')}</Link>
              <Link to="/login">{t('header.logout')}</Link>
            </Box>
          )}
        </Box>
      </div>
    </header>
  );
};

export default Header;