// Step5.jsx

import React, { useRef, useState } from 'react';
import './Step5.css'; // Assurez-vous que ce chemin est correct

const Step5 = ({ prevStep, values, handleSubmit, handleChange }) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles(files);
    handleChange('annexDocuments', files);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="step-form">
      <h3>Récapitulatif</h3>

      {/* Détails de la commande */}
      <div className="recap-section">
        <div className="recap-item">
          <span className="recap-label">Nom de la commande :</span>
          <span className="recap-value">{values.orderName || 'Non spécifié'}</span>
        </div>
        {values.productType && (
          <div className="recap-item">
            <span className="recap-label">Type de produit :</span>
            <span className="recap-value">{values.productType}</span>
          </div>
        )}
      </div>

      {/* Informations sur l'Exportateur */}
      <div className="recap-section">
        <h4>Informations sur l'Exportateur</h4>
        <div className="recap-item">
          <span className="recap-label">Nom :</span>
          <span className="recap-value">{values.exporterName || 'Non spécifié'}</span>
        </div>
        {values.exporterCompany2 && (
          <div className="recap-item">
            <span className="recap-label">Entreprise :</span>
            <span className="recap-value">{values.exporterCompany2}</span>
          </div>
        )}
        <div className="recap-item">
          <span className="recap-label">Adresse :</span>
          <span className="recap-value">
            {values.exporterAddress}
            {values.exporterAddress2 && `, ${values.exporterAddress2}`}, {values.exporterCity}, {values.exporterPostalCode}, {values.exporterCountry}
          </span>
        </div>
        <div className="recap-item">
          <span className="recap-label">Numéro de téléphone :</span>
          <span className="recap-value">{values.exporterPostalCode || 'Non spécifié'}</span>
        </div>
      </div>

      {/* Informations sur le Destinataire */}
      <div className="recap-section">
        <h4>Informations sur le Destinataire</h4>
        <div className="recap-item">
          <span className="recap-label">Nom :</span>
          <span className="recap-value">{values.receiverName || 'Non spécifié'}</span>
        </div>
        {values.receiverCompany2 && (
          <div className="recap-item">
            <span className="recap-label">Entreprise :</span>
            <span className="recap-value">{values.receiverCompany2}</span>
          </div>
        )}
        <div className="recap-item">
          <span className="recap-label">Adresse :</span>
          <span className="recap-value">
            {values.receiverAddress}
            {values.receiverAddress2 && `, ${values.receiverAddress2}`}, {values.receiverCity}, {values.receiverPostalCode}, {values.receiverCountry}
          </span>
        </div>
        <div className="recap-item">
          <span className="recap-label">Numéro de téléphone :</span>
          <span className="recap-value">{values.receiverPostalCode || 'Non spécifié'}</span>
        </div>
      </div>

      {/* Origine et Destination des Marchandises */}
      <div className="recap-section">
        <h4>Origine et Destination des Marchandises</h4>
        <div className="recap-item">
          <span className="recap-label">Pays d'origine :</span>
          <span className="recap-value">{values.goodsOrigin || 'Non spécifié'}</span>
        </div>
        <div className="recap-item">
          <span className="recap-label">Pays de destination :</span>
          <span className="recap-value">{values.goodsDestination || 'Non spécifié'}</span>
        </div>
      </div>

      {/* Modes de Transport */}
      <div className="recap-section">
        <h4>Modes de Transport</h4>
        <div className="recap-item">
          <span className="recap-label">Mode(s) sélectionné(s) :</span>
          <span className="recap-value">
            {Object.keys(values.transportModes)
              .filter(key => values.transportModes[key])
              .join(', ') || 'Non spécifié'}
          </span>
        </div>
        {values.transportRemarks && (
          <div className="recap-item">
            <span className="recap-label">Remarques sur le transport :</span>
            <span className="recap-value">{values.transportRemarks}</span>
          </div>
        )}
      </div>

      {/* Liste des Marchandises */}
      <div className="recap-section">
        <h4>Liste des Marchandises</h4>
        {values.merchandises.length > 0 ? (
          <table className="merchandise-table">
            <thead>
              <tr>
                <th>Désignation</th>
                <th>Référence / HSCODE</th>
                <th>Quantité</th>
                <th>Unité</th>
              </tr>
            </thead>
            <tbody>
              {values.merchandises.map((item, index) => (
                <tr key={index}>
                  <td>{item.designation || 'Non spécifié'}</td>
                  <td>{item.boxReference || 'Non spécifié'}</td>
                  <td>{item.quantity || 'Non spécifié'}</td>
                  <td>{item.unit || 'Non spécifié'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Aucune marchandise ajoutée.</p>
        )}
      </div>

      {/* Nombre d'Exemplaires */}
      <div className="recap-section">
        <h4>Nombre d'Exemplaires</h4>
        <div className="recap-item">
          <span className="recap-label">Copies demandées :</span>
          <span className="recap-value">{values.copies}</span>
        </div>
      </div>

      {/* Remarques */}
      {values.remarks && (
        <div className="recap-section">
          <h4>Remarques</h4>
          <div className="recap-item">
            <span className="recap-value">{values.remarks}</span>
          </div>
        </div>
      )}

      {/* Engagement */}
      <div className="recap-section">
        <h4>Engagement</h4>
        <div className="recap-item">
          <span className="recap-value">
            {values.isCommitted ? 'Je suis engagé selon les conditions définies.' : 'Non engagé.'}
          </span>
        </div>
      </div>

      {/* Section pour Ajouter des Documents Annexes */}
      <div className="recap-section upload-section">
        <span>Voulez-vous ajouter des documents annexes (légalisations) :</span>
        <button type="button" className="upload-button" onClick={triggerFileInput}>
          Choisir le fichier
        </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          multiple
          onChange={handleFileChange}
        />
        {uploadedFiles.length > 0 && (
          <div className="uploaded-files">
            <h5>Fichiers sélectionnés :</h5>
            <ul>
              {uploadedFiles.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="step-actions">
        <button type="button" onClick={prevStep} className="previous-button">
          Retour
        </button>
        <button type="button" className="next-button" onClick={handleSubmit}>
          Soumettre
        </button>
      </div>
    </div>
  );
};

export default Step5;
