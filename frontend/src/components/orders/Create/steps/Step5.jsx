import React from 'react';
import './Step5.css';

const Step5 = ({ prevStep, values, handleSubmit, isModal, openSecondModal }) => {
  // Valeur en dur pour le Demandeur
  const fixedExporterName = 'INDIGO TRADING FZCO';

  return (
    <div className="step-form">
      <h3>Récapitulatif</h3>

      {/* Titre et bouton "Modifier" pour Désignation commande */}
      <div className="designation-header">
        <h4>Désignation commande</h4>
        {!isModal && (
          <button type="button" className="modifier-button">
            Modifier
          </button>
        )}
      </div>

      {/* Section Désignation commande */}
      <div className="designation-commande">
        {/* Affichage du Demandeur */}
        <div className="recap-item">
          <span className="recap-label">Demandeur :</span>
          {isModal ? (
            <span
              className="recap-value exporter-name-step5 clickable"
              onClick={() =>
                openSecondModal({
                  name: fixedExporterName,
                  address: '123 Rue Principale, Ville, Pays',
                  address2: 'Suite 456',
                  contact: 'M. Vladimir Outof\nManager',
                  activity: 'Construction',
                  statut: 'Actif',
                })
              }
            >
              {fixedExporterName}
            </span>
          ) : (
            <span className="recap-value exporter-name-step5">
              {fixedExporterName}
            </span>
          )}
        </div>

        {/* Affichage du Libellé */}
        <div className="recap-item">
          <span className="recap-label">Libellé :</span>
          <span className="recap-value">
            {values.orderLabel || 'Aucun libellé spécifié'}
          </span>
        </div>
      </div>

      {/* Titre et bouton "Modifier" pour Certificat d'origine */}
      <div className="designation-header">
        <h4>Contenu du Certificat d'origine</h4>
        {!isModal && (
          <button type="button" className="modifier-button">
            Modifier
          </button>
        )}
      </div>

      {/* Section Contenu du certificat d'origine */}
      <div className="contenu-certificat">
        {/* Informations sur le Destinataire */}
        <div className="recap-section">
          <h5>Informations sur le Destinataire</h5>
          <div className="recap-item">
            <span className="recap-label">Nom :</span>
            <span className="recap-value">
              {values.receiverName || 'Non spécifié'}
            </span>
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
              {values.receiverAddress2 && `, ${values.receiverAddress2}`},{' '}
              {values.receiverCity}, {values.receiverPostalCode},{' '}
              {values.receiverCountry}
            </span>
          </div>
          <div className="recap-item">
            <span className="recap-label">Numéro de téléphone :</span>
            <span className="recap-value">
              {values.receiverPhone || 'Non spécifié'}
            </span>
          </div>
        </div>

        {/* Origine et Destination des Marchandises */}
        <div className="recap-section">
          <h5>Origine et Destination des Marchandises</h5>
          <div className="recap-item">
            <span className="recap-label">Pays d'origine :</span>
            <span className="recap-value">
              {values.goodsOrigin || 'Non spécifié'}
            </span>
          </div>
          <div className="recap-item">
            <span className="recap-label">Pays de destination :</span>
            <span className="recap-value">
              {values.goodsDestination || 'Non spécifié'}
            </span>
          </div>
        </div>

        {/* Modes de Transport */}
        <div className="recap-section">
          <h5>Modes de Transport</h5>
          <div className="recap-item">
            <span className="recap-label">Mode(s) sélectionné(s) :</span>
            <span className="recap-value">
              {values.transportModes
                ? Object.keys(values.transportModes)
                    .filter((key) => values.transportModes[key])
                    .join(', ') || 'Non spécifié'
                : 'Non spécifié'}
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
          <h5>Liste des Marchandises</h5>
          {values.merchandises && values.merchandises.length > 0 ? (
            <div className="table-responsive">
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
            </div>
          ) : (
            <p>Aucune marchandise ajoutée.</p>
          )}
        </div>

        {/* Nombre d'Exemplaires */}
        <div className="recap-section">
          <h5>Nombre d'Exemplaires</h5>
          <div className="recap-item">
            <span className="recap-label">Copies demandées :</span>
            <span className="recap-value">
              {values.copies || 'Non spécifié'}
            </span>
          </div>
        </div>

        {/* Remarques */}
        {values.remarks && (
          <div className="recap-section">
            <h5>Remarques</h5>
            <div className="recap-item">
              <span className="recap-value">{values.remarks}</span>
            </div>
          </div>
        )}

        {/* Engagement */}
        <div className="recap-section">
          <h5>Engagement</h5>
          <div className="recap-item">
            <span className="recap-value">
              {values.isCommitted
                ? 'Je suis engagé selon les conditions définies.'
                : 'Non engagé.'}
            </span>
          </div>
        </div>
      </div>

      {/* Titre et bouton "Modifier" pour Pièces justificatives */}
      <div className="designation-header">
        <h4>Pièces justificatives</h4>
        {!isModal && (
          <button type="button" className="modifier-button">
            Modifier
          </button>
        )}
      </div>

      <div className="pieces-justificatives">
        {values.documents && values.documents.length > 0 ? (
          <div className="table-responsive">
            <table className="document-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Type</th>
                  <th>Remarque</th>
                  <th>Fichier</th>
                </tr>
              </thead>
              <tbody>
                {values.documents.map((doc, index) => (
                  <tr key={index}>
                    <td>{doc.name}</td>
                    <td>
                      {doc.type === 'justificative'
                        ? 'Justificative'
                        : 'Annexe'}
                    </td>
                    <td>{doc.remarks || 'Aucune remarque'}</td>
                    <td>{doc.file ? doc.file.name : 'Aucun fichier'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Aucune pièce justificative ajoutée.</p>
        )}
      </div>

      {/* Actions */}
      {!isModal && (
        <>
          <div className="action-buttons">
            <span>Voulez-vous ajouter des documents annexes ?</span>
            <button type="button" className="legislation-button">
              Légalisation des documents
            </button>
          </div>

          <div className="submit-section">
            <button
              type="button"
              className="next-button-step5"
              onClick={handleSubmit}
            >
              Soumettre
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Step5;
