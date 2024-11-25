import React from 'react';
import './ClientProfile.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faMapMarkerAlt, faPhone } from '@fortawesome/free-solid-svg-icons';

const ClientProfile = ({ clientData, closeModal }) => {
  return (
    <div className="client-profile">
      <h3>PROFIL CLIENT</h3>

      {/* Informations du client */}
      <div className="client-info">
        <div className="info-item">
          <span className="info-value">{clientData.name || 'Non spécifié'}</span>
        </div>
        <div className="info-item">
          <span className="info-value">{clientData.address || 'Non spécifié'}</span>
        </div>
        <div className="info-item">
          <span className="info-value">{clientData.address2 || 'Non spécifié'}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Secteur activité : </span>
          <span className="info-value">{clientData.activity || 'Non spécifié'}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Statut : </span>
          <span className="info-value">{clientData.statut || 'Non spécifié'}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Contact : </span>
          <span className="info-value">{clientData.contact || 'Non spécifié'}</span>
        </div>
      </div>

      {/* Bouton Fermer */}
      <div className="client-actions">
        <button onClick={closeModal} className="close-button">
          Fermer
        </button>
      </div>
    </div>
  );
};

export default ClientProfile;
