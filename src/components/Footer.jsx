import React from 'react';
import { useTranslation } from 'react-i18next';
import './Footer.css';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="footer-container">
        <p className="footer-logo">{t('footer.copyright')}</p>
        <div className="footer-info">
          <a href="/mentions-legales" className="footer-link">{t('footer.legalMentions')}</a>
          <p className="footer-address">{t('footer.address')}</p>
          <p className="footer-email">{t('footer.email')}: <a href="mailto:ccd@ccd.dj">ccd@ccd.dj</a></p>
          <p className="footer-hours">{t('footer.openingHours')}</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;