import React from 'react';

const Step5 = ({ prevStep, values, handleSubmit }) => {
  return (
    <div className="step-form">
      <h3>Step 5: Récapitulatif</h3>
      <div className="recap-section">
        <h4>Command Details</h4>
        <p><strong>Order Name:</strong> {values.orderName}</p>
        <p><strong>Product Type:</strong> {values.productType}</p>
      </div>
      <div className="recap-section">
        <h4>Origine des marchandises</h4>
        <p><strong>Pays d'origine:</strong> {values.originCountry}</p>
        <p><strong>Pays de destination:</strong> {values.destinationCountry}</p>
        <p><strong>Mode de transport:</strong> {Object.keys(values.transportModes).filter(key => values.transportModes[key]).join(', ')}</p>
        {values.comment && (
          <p><strong>Commentaire:</strong> {values.comment}</p>
        )}
        <h4>Liste des marchandises</h4>
        <ul>
          {values.merchandises.map((item, index) => (
            <li key={index}>
              {item.designation} - {item.reference} - {item.quantity}
            </li>
          ))}
        </ul>
      </div>
      <div className="recap-section">
        <h4>Nombre de copie certifié</h4>
        <p>{values.copies}</p>
      </div>
      <div className="recap-section">
        <h4>Pièces justificatives</h4>
        <ul>
          {values.documents.map((doc, index) => (
            <li key={index}>{doc}</li>
          ))}
        </ul>
      </div>
      <div className="step-actions">
        <button type="button" onClick={prevStep}>
          Back
        </button>
        <button type="button" className="next-button" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default Step5;
