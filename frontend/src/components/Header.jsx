import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faShoppingCart,
  faBars,
  faTimes,
  faUser,
  faCertificate,
  faDollarSign,
  faGavel,
} from '@fortawesome/free-solid-svg-icons';

import logo from '../assets/logo.jpg';
import './Header.css';
import { useSelector } from 'react-redux';
import { getMemo, getOrderStaticsByServices } from '../services/apiServices';

const Header = ({ toggleMenu, isMenuOpen }) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [cartItemCount, setCartItemCount] = useState(0);

  const user = useSelector((state) => state.auth.user);
  const custAccountId = user?.id_cust_account;

  // Fetch cart item count
  useEffect(() => {
    const fetchCartCount = async () => {
      if (!custAccountId) return;
      const params = {
        p_date_start: null,
        p_date_end: null,
        p_id_list_order: null,
        p_id_custaccount: custAccountId,
        p_borderstatus_insert_exclusif: true,
        p_borderstatus_new_exclusif: false,
        p_borderstatus_new: false,
        p_borderstatus_approved: false,
        p_borderstatus_paid: false,
      };
      try {
        const result = await getOrderStaticsByServices(params);
        if (result?.data?.length) {
          const data = result.data[0];
          const total =
            Number(data.count_ord_certif_ori) +
            Number(data.count_ord_legalization) +
            Number(data.count_ord_com_invoice);
          setCartItemCount(total);
        }
      } catch (error) {
        console.error('Error fetching order statistics:', error);
      }
    };
    fetchCartCount();
  }, [custAccountId]);

  // Fetch notifications (memos)
  useEffect(() => {
    const fetchMemos = async () => {
      if (!custAccountId) return;
      const params = { p_isAck: 'false', p_id_cust_account: custAccountId, p_isopuser: 'false' };
      try {
        const result = await getMemo(params);
        setNotificationsCount(result?.data?.length || 0);
      } catch (error) {
        console.error('Error fetching memos:', error);
      }
    };
    fetchMemos();
  }, [custAccountId]);

  const toggleDropdown = () => setDropdownOpen((open) => !open);

  return (
    <header className="header">
      {/* Mobile menu button */}
      <div
        className="mobile-menu-button"
        onClick={toggleMenu}
        aria-label="Toggle menu"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && toggleMenu()}
      >
        <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} style={{ fontSize: '1rem' }} />
      </div>

      {/* Logo */}
      <div className="header-v2__logo-container">
        <img src={logo} alt="Chambre de Commerce de Djibouti" className="header-v2__logo" />
      </div>

      {/* Center navigation links with icons */}
      <nav className="header-center">
        <Button
          component={Link}
          to="/dashboard/cgv"
          startIcon={<FontAwesomeIcon icon={faCertificate} />}
          sx={{ textTransform: 'none', mx: 1 }}
          color={location.pathname === '/dashboard/cgv' ? 'primary' : 'inherit'}
        >
          C.G.V
        </Button>
        <Button
          component={Link}
          to="/dashboard/prestation-service"
          startIcon={<FontAwesomeIcon icon={faDollarSign} />}
          sx={{ textTransform: 'none', mx: 1 }}
          color={location.pathname === '/dashboard/prestation-service' ? 'primary' : 'inherit'}
        >
          Prestation de services
        </Button>
        <Button
          component={Link}
          to="/dashboard/mentions-legales"
          startIcon={<FontAwesomeIcon icon={faGavel} />}
          sx={{ textTransform: 'none', mx: 1 }}
          color={location.pathname === '/dashboard/mentions-legales' ? 'primary' : 'inherit'}
        >
          Mentions légales
        </Button>
      </nav>

      {/* Right icons */}
      <div className="header-right">
        {/* Notifications */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Link to="/dashboard/notifications">
            <Badge badgeContent={notificationsCount} color="error" anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
              <FontAwesomeIcon icon={faBell} style={{ fontSize: '1rem' }} />
            </Badge>
          </Link>
          <Typography variant="caption">Notifications</Typography>
        </Box>

        {/* Cart */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Badge badgeContent={cartItemCount} color="error" anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
            <FontAwesomeIcon icon={faShoppingCart} style={{ fontSize: '1rem' }} />
          </Badge>
          <Typography variant="caption">Panier</Typography>
        </Box>

        {/* Profile dropdown */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          <Avatar onClick={toggleDropdown} sx={{ width: 32, height: 32, backgroundColor: '#DDAF26' }}>
            <FontAwesomeIcon icon={faUser} style={{ color: 'white', fontSize: '1rem' }} />
          </Avatar>
          {dropdownOpen && (
            <Box sx={{ position: 'absolute', top: '100%', right: 0, backgroundColor: 'white', boxShadow: 3, p: 1, mt: 1, zIndex: 1000 }}>
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