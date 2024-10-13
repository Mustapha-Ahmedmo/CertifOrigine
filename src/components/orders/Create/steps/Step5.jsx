import React from 'react';

const Step5 = ({ prevStep, values, handleSubmit }) => {
  return (
    <div className="step-form">
      <h3>Récapitulatif</h3>

      {/* Command Details */}
      <div className="recap-section">
        <h4>Détails de la commande</h4>
        <p><strong>Nom de la commande :</strong> {values.orderName}</p>
        {values.productType && <p><strong>Type de produit :</strong> {values.productType}</p>}
      </div>

      {/* Exporter Details */}
      <div className="recap-section">
        <h4>Informations sur l'exportateur</h4>
        <p><strong>Nom :</strong> {values.exporterName}</p>
        {values.exporterCompany2 && <p><strong>Entreprise :</strong> {values.exporterCompany2}</p>}
        <p><strong>Adresse :</strong> {values.exporterAddress}, {values.exporterCity}, {values.exporterPostalCode}, {values.exporterCountry}</p>
        {values.exporterAddress2 && <p><strong>Complément d'adresse :</strong> {values.exporterAddress2}</p>}
      </div>

      {/* Receiver Details */}
      <div className="recap-section">
        <h4>Informations sur le destinataire</h4>
        <p><strong>Nom :</strong> {values.receiverName}</p>
        {values.receiverCompany2 && <p><strong>Entreprise :</strong> {values.receiverCompany2}</p>}
        <p><strong>Adresse :</strong> {values.receiverAddress}, {values.receiverCity}, {values.receiverPostalCode}, {values.receiverCountry}</p>
        {values.receiverAddress2 && <p><strong>Complément d'adresse :</strong> {values.receiverAddress2}</p>}
      </div>

      {/* Origin and Destination */}
      <div className="recap-section">
        <h4>Origine des marchandises</h4>
        <p><strong>Pays d'origine :</strong> {values.goodsOrigin}</p>
      </div>

      {/* Transport Modes */}
      <div className="recap-section">
        <h4>Modes de transport</h4>
        <p><strong>Mode(s) sélectionné(s) :</strong> {Object.keys(values.transportModes).filter(key => values.transportModes[key]).join(', ')}</p>
        {values.transportComment && <p><strong>Commentaire sur le transport :</strong> {values.transportComment}</p>}
      </div>

      {/* Merchandises List */}
      <div className="recap-section">
        <h4>Liste des marchandises</h4>
        {values.merchandises.length > 0 ? (
          <ul>
            {values.merchandises.map((item, index) => (
              <li key={index}>
                <strong>Désignation :</strong> {item.designation} - <strong>Quantité :</strong> {item.quantity} - <strong>Unité :</strong> {item.unit}
              </li>
            ))}
          </ul>
        ) : (
          <p>Aucune marchandise ajoutée.</p>
        )}
      </div>

      {/* Paper Copy */}
      <div className="recap-section">
        <h4>Nombre d'exemplaires</h4>
        <p>{values.isPaperCopy ? 'Un exemplaire papier est demandé' : 'Aucun exemplaire papier demandé'}</p>
      </div>

      {/* Remarks */}
      {values.remarks && (
        <div className="recap-section">
          <h4>Remarques</h4>
          <p>{values.remarks}</p>
        </div>
      )}

      {/* Engagement Section */}
      <div className="recap-section">
        <h4>Engagement</h4>
        <p>{values.isCommitted ? 'Je suis engagé selon les conditions définies.' : 'Non engagé.'}</p>
      </div>

      {/* Actions */}
      <div className="step-actions">
        <button type="button" onClick={prevStep}>
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