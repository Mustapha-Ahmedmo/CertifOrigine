import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <p className="footer-logo">@2024 - CHAMBRE DE COMMERCE DE DJIBOUTI</p>
                <div className="footer-info">
                    <a href="/mentions-legales" className="footer-link">Mentions légales</a>
                    <p className="footer-address">Adresse : Place Lagarde, Djibouti - +(253) 21 35 10 70</p>
                    <p className="footer-email">Email : <a href="mailto:ccd@ccd.dj">ccd@ccd.dj</a></p>
                    <p className="footer-hours">Horaire d'ouverture</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
