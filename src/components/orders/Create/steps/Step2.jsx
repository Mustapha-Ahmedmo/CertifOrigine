import React, { useState } from 'react';

const Step2 = ({ nextStep, prevStep, handleChange, values }) => {
  const { cci, referenceCommande, billingOption, legalCategory } = values;
  const [selectedCCI, setSelectedCCI] = useState('');
  const [billingAddress, setBillingAddress] = useState(billingOption);
  const [legalCategorySelected, setLegalCategorySelected] = useState(legalCategory);

  const handleCCIChange = (e) => {
    setSelectedCCI(e.target.value);
    handleChange('cci', e.target.value);
  };

  const handleBillingOptionChange = (e) => {
    setBillingAddress(e.target.value);
    handleChange('billingOption', e.target.value);
  };

  const handleLegalCategoryChange = (e) => {
    setLegalCategorySelected(e.target.value);
    handleChange('legalCategory', e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="step-form">
      <h3>ÉTAPE 3 - LIVRAISON ET FACTURATION</h3>

      <div className="form-group">
        <label htmlFor="cci">1/3 CHOISIR UNE CCI</label>
        <select id="cci" value={selectedCCI} onChange={handleCCIChange} required>
          <option value="">Sélectionner une CCI</option>
          <option value="cci-djibouti">Chambre de Commerce de Djibouti</option>
        </select>

        {selectedCCI === 'cci-djibouti' && (
          <div className="cci-details">
            <p><strong>CCI Djibouti</strong></p>
            <p>Place Lagarde<br />Djibouti</p>
            <p>+253 21 35 10 70<br />ccd@ccd.dj</p>
          </div>
        )}
      </div>

      <div className="form-group">
        <label>2/3 SERVICES PROPOSÉS PAR LA CCI SÉLECTIONNÉE</label>
        <p>Cette CCI ne propose aucun service supplémentaire</p>
      </div>

      <div className="form-group">
        <label>3/3 COORDONNÉES DE FACTURATION</label>
        <label htmlFor="referenceCommande">Référence de votre commande (à reporter sur la facture)</label>
        <input
          type="text"
          id="referenceCommande"
          value={referenceCommande}
          onChange={(e) => handleChange('referenceCommande', e.target.value)}
        />

        <div className="billing-options">
          <label>
            <input
              type="radio"
              name="billingOption"
              value="existing"
              checked={billingAddress === 'existing'}
              onChange={handleBillingOptionChange}
            />
            Choisir une adresse de facturation existante
          </label>
          <label>
            <input
              type="radio"
              name="billingOption"
              value="new"
              checked={billingAddress === 'new'}
              onChange={handleBillingOptionChange}
            />
            Ajouter une nouvelle adresse de facturation
          </label>
        </div>

        {billingAddress === 'new' && (
          <div className="new-billing-address">
            <label>Catégorie juridique*</label>
            <select value={legalCategorySelected} onChange={handleLegalCategoryChange} required>
              <option value="">Sélectionner une catégorie</option>
              <option value="particulier">Particulier</option>
              <option value="entreprise1">Entreprise (SA, SAS)</option>
              <option value="entreprise2">Entreprise (SARL, EURL, EPIC, SCOP)</option>
              <option value="association">Association, Fédération, Administration, Organisme public</option>
              <option value="profession-liberale">Profession libérale, Entreprise individuelle</option>
              <option value="societe-etrangere">Société étrangère</option>
            </select>

            {legalCategorySelected === 'particulier' && (
              <div className="particulier-fields">
                <label>Nom*</label>
                <input type="text" required />
                <label>Prénom*</label>
                <input type="text" required />
                <label>Type de pièce d'identité*</label>
                <select required>
                  <option value="">Veuillez sélectionner</option>
                  <option value="cni">Carte d'identité</option>
                  <option value="passeport">Passeport</option>
                </select>
                <label>Adresse*</label>
                <input type="text" required />
                <label>C.P.*</label>
                <input type="text" required />
                <label>Ville*</label>
                <input type="text" required />
                <label>Pays*</label>
                <input type="text" required />
              </div>
            )}

            {legalCategorySelected !== 'particulier' && legalCategorySelected !== '' && (
              <div className="company-fields">
                <label>Raison sociale*</label>
                <input type="text" required />
                <label>Numéro de TVA*</label>
                <input type="text" required />
                <label>Adresse*</label>
                <input type="text" required />
                <label>C.P.*</label>
                <input type="text" required />
                <label>Ville*</label>
                <input type="text" required />
                <label>Pays*</label>
                <input type="text" required />
                <label>Email*</label>
                <input type="text" required />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="step-actions">
        <button type="button" onClick={prevStep}>Back</button>
        <button type="submit" className="next-button">Next</button>
      </div>
    </form>
  );
};

export default Step2;