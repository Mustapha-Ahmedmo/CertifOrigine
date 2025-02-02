import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Step1.css';
import {
  addOrUpdateGoods,
  addRecipient,
  createCertificate,
  fetchCountries,
  fetchRecipients,
  getCertifGoodsInfo,
  getTransmodeInfo,
  getUnitWeightInfo,
  setOrdCertifTranspMode
} from '../../../../services/apiServices';
import { useSelector } from 'react-redux';

const Step2 = ({ nextStep, handleMerchandiseChange, handleChange, values = {} }) => {
  const { t } = useTranslation();
  const [isNewDestinataire, setIsNewDestinataire] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [recipients, setRecipients] = useState([]); // State for actual recipients
  const [selectedRecipient, setSelectedRecipient] = useState(''); // Selected recipient ID
  const [selectedFakeCompany, setSelectedFakeCompany] = useState('');

  const [countries, setCountries] = useState([]); // State for countries
  const [transportModes, setTransportModes] = useState([]); // State for transport modes (from API)
  const [unitWeights, setUnitWeights] = useState([]); // State for unit weights

  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  // Extract query params (certifId and orderId)
  const params = new URLSearchParams(location.search);
  const certifId = params.get('certifId');
  const orderId = params.get('orderId');

  const auth = useSelector((state) => state.auth); // Access user data from Redux
  const customerAccountId = auth?.user?.id_cust_account; // Customer Account ID from the logged-in user

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // If certifId exists, fetch goods data and populate values.merchandises
        if (certifId) {
          const goodsResponse = await getCertifGoodsInfo(certifId);
          const fetchedGoods = goodsResponse.data || [];
          handleChange('merchandises', fetchedGoods.map((good) => ({
            designation: good.goodDescription,
            boxReference: good.goodReferences,
            quantity: good.quantity,
            unit: good.unit || 'N/A',
          })));
        }

        // Fetch countries
        const fetchedCountries = await fetchCountries();
        setCountries(fetchedCountries);

        // Fetch transport modes
        // For getTransmodeInfo, we assume it accepts (idListCT, isActiveTM) or similar parameters.
        const fetchedTransportModes = await getTransmodeInfo(null, true);
        setTransportModes(fetchedTransportModes.data);

        // Fetch unit weights
        const fetchedUnitWeights = await getUnitWeightInfo(null, true);
        setUnitWeights(fetchedUnitWeights.data);

        // Fetch recipients if no certifId and a customerAccountId exists
        if (!certifId && customerAccountId) {
          const recipientFetched = await fetchRecipients({
            idListCA: customerAccountId, // Fetch recipients by customer account ID
          });
          setRecipients(recipientFetched.data);
          handleChange('recipients', recipientFetched.data);
          console.log(recipientFetched);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, [certifId, customerAccountId]);

  // Use safeValues as fallback
  const safeValues = values || {
    goodsOrigin: '',
    goodsDestination: '',
    merchandises: [],
    remarks: '',
    copies: 1,
    isCommitted: false,
    transportModes: {} // Initialize as an object
  };

  // Compute a joined string of selected transport mode labels directly from form data.
  // This code assumes that values.transportModes is an object like:
  // { air: true, mer: false, terre: false, mixte: true }
  const selectedTransportModes = Object.keys(safeValues.transportModes)
    .filter(key => safeValues.transportModes[key])
    .map(key => key.charAt(0).toUpperCase() + key.slice(1))  // Capitalize first letter
    .join(', ') || 'Aucun mode sélectionné';

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1) Validate transport modes: at least one must be selected.
    const isTransportSelected = Object.keys(safeValues.transportModes).some(
      (key) => safeValues.transportModes[key]
    );
    if (!isTransportSelected) {
      setErrorMessage('Veuillez sélectionner au moins un mode de transport.');
      return;
    }

    // 2) Validate merchandise: at least one must be added.
    if (safeValues.merchandises.length === 0) {
      setErrorMessage('Veuillez ajouter au moins une marchandise.');
      return;
    }

    let recipientId = selectedRecipient; // Default to selected recipient ID

    // 3) If user wants to create a new recipient (destinataire)
    if (isNewDestinataire) {
      try {
        // 1) Construire l'objet pour le nouveau destinataire
        const newRecipientData = {
          idRecipientAccount: null,
          idCustAccount: customerAccountId,
          recipientName: safeValues.receiverName,
          address1: safeValues.receiverAddress,
          address2: safeValues.receiverAddress2,
          address3: safeValues.receiverPostalCode,
          idCity: 1, // Or the correct city ID
          statutFlag: 1,
          activationDate: new Date().toISOString(),
          deactivationDate: new Date('9999-12-31').toISOString(), // Future date
          idLoginInsert: auth?.user?.id_login_user || 1,
          idLoginModify: null,
        };
    
        // 2) Création du nouveau destinataire
        const recipientResponse = await addRecipient(newRecipientData);
        console.log('New recipient created successfully!', recipientResponse);
    
        // Récupérer l'ID du nouveau destinataire
        recipientId = recipientResponse?.newRecipientId;
        console.log('New recipient ID =', recipientId);
    
        // 3) Re-fetch de la liste complète des destinataires
        const updatedRecipientsResponse = await fetchRecipients({
          idListCA: customerAccountId, // Paramètre pour récupérer la liste
        });
        console.log('Liste mise à jour des destinataires:', updatedRecipientsResponse.data);
    
        // 4) Mise à jour du state local et de values
        setRecipients(updatedRecipientsResponse.data);
        handleChange('recipients', updatedRecipientsResponse.data);
    
        // 5) (Optionnel) Pré-sélection de ce nouveau destinataire si tu le souhaites
        setSelectedRecipient(recipientId);
        handleChange('selectedRecipientId', recipientId);
    
      } catch (error) {
        console.error('Error creating new recipient:', error);
        setErrorMessage(
          "Erreur lors de la création du nouveau destinataire. Veuillez réessayer."
        );
        return;
      }
    }
    

    // Convert country names to country IDs using fetched countries
    const getCountryId = (countryName) => {
      const foundCountry = countries.find(country => country.symbol_fr === countryName);
      return foundCountry ? foundCountry.id_country : null;
    };

    const certData = {
      idOrder: safeValues.orderId, // Ensure order ID is available
      idRecipientAccount: recipientId,
      idCountryOrigin: getCountryId(safeValues.goodsOrigin),  // Convert to ID
      idCountryDestination: getCountryId(safeValues.goodsDestination),  // Convert to ID
      notes: safeValues.remarks,
      copyCount: safeValues.copies,
      idLoginInsert: auth?.user?.id_login_user || 1,
      transportRemarks: safeValues.transportRemarks,
    };

    const certResponse = await createCertificate(certData);
    console.log('Certificate created successfully:', certResponse);

    for (const merchandise of safeValues.merchandises) {
      try {
        const normalizeText = (text) => text.toLowerCase().trim();

        const matchedUnit = unitWeights.find(
          (unit) => normalizeText(unit.symbol_fr) === normalizeText(merchandise.unit)
        );
        const goodsData = {
          idOrdCertifOri: certResponse.newCertifId, // Use the newly created certificate ID
          goodDescription: merchandise.designation,
          goodReferences: merchandise.boxReference,
          idUnitWeight: matchedUnit ? matchedUnit.id_unit_weight : null,
        };

        console.log("Merchandise => ", merchandise);

        const goodsResponse = await addOrUpdateGoods(goodsData);
        console.log('Goods added successfully:', goodsResponse);
      } catch (error) {
        console.error('Error adding goods:', error);
        setErrorMessage("Erreur lors de l'ajout des marchandises. Veuillez réessayer.");
        return;
      }

      // 7) For each selected transport mode, call setOrdCertifTranspMode
      //    We rely on transportModes (from getTransmodeInfo) to match ID by the mode's symbol_eng (lowercase)
      const selectedModeKeys = Object.keys(values.transportModes || {}).filter(
        (key) => values.transportModes[key]
      );

      for (const key of selectedModeKeys) {
        // Find the matching mode in your fetched transportModes
        const matched = transportModes.find(
          (tm) => tm.symbol_eng.toLowerCase() === key
        );
        if (matched) {
          // Call setOrdCertifTranspMode with the new certificate ID
          const result = await setOrdCertifTranspMode({
            id_ord_certif_transp_mode: null,
            id_ord_certif_ori: certResponse.newCertifId,
            id_transport_mode: matched.id_transport_mode,
          });
          console.log('Transport mode set:', result);
        }
      }
    }

    // 4) If everything is okay, proceed to next step
    setErrorMessage('');
    nextStep();
  };

  const addMerchandise = () => {
    if (!safeValues.designation || !safeValues.quantity || !safeValues.boxReference) return;

    const newMerchandise = {
      designation: safeValues.designation,
      boxReference: safeValues.boxReference,
      quantity: safeValues.quantity,
      unit: safeValues.unit,
    };

    handleMerchandiseChange(newMerchandise);

    handleChange('designation', '');
    handleChange('quantity', '');
    handleChange('boxReference', '');
    handleChange('unit', 'kg');
  };

  const removeMerchandise = (index) => {
    const updatedMerchandises = safeValues.merchandises.filter((_, i) => i !== index);
    handleChange('merchandises', updatedMerchandises);
  };

  return (
    <form onSubmit={handleSubmit} className="step-form">
      <h3>{t('step1.title')}</h3>

      <div className="section-title">{t('step1.exporterTitle')}</div>
      <p className="exporter-name">INDIGO TRADING FZCO</p>
      <hr />

      <div className="section-title">{t('step1.receiverTitle')}</div>
      <div className="form-group form-group-radio">
        <label>
          <input
            type="radio"
            name="destinataire"
            value="choisir"
            defaultChecked
            onChange={() => setIsNewDestinataire(false)}
          />{' '}
          {t('step1.chooseReceiver')}
        </label>
        <label>
          <input
            type="radio"
            name="destinataire"
            value="saisir"
            onChange={() => setIsNewDestinataire(true)}
          />{' '}
          {t('step1.enterNewReceiver')}
        </label>
      </div>

      {!isNewDestinataire && (
        <div className="form-group">
          <label>Choisir une entreprise *</label>
          <select
            value={selectedRecipient}
            onChange={(e) => {
              const selectedId = e.target.value;
              setSelectedRecipient(selectedId);
              handleChange('selectedRecipientId', selectedId);

              // Find the selected recipient and update form data accordingly
              const recipient = recipients.find(
                (r) => r.id_recipient_account.toString() === selectedId
              );

              if (recipient) {
                handleChange('receiverName', recipient.recipient_name);
                handleChange('receiverAddress', recipient.address_1);
                handleChange('receiverAddress2', recipient.address_2);
                handleChange('receiverPostalCode', recipient.address_3);
                handleChange('receiverCity', recipient.city_symbol_fr_recipient);
                handleChange('receiverCountry', recipient.country_symbol_fr_recipient);
                handleChange('receiverPhone', recipient.trade_registration_num);
              }
            }}
            required
          >
            <option value="">-- Sélectionnez une entreprise --</option>
            {recipients.map((recipient) => (
              <option
                key={recipient.id_recipient_account}
                value={recipient.id_recipient_account}
              >
                {recipient.recipient_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {isNewDestinataire && (
        <>
          <div className="form-group-row">
            <div className="form-group">
              <label>{t('step1.companyName')} *</label>
              <input
                type="text"
                value={safeValues.receiverName}
                onChange={(e) => handleChange('receiverName', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label>{t('step1.address')} *</label>
              <input
                type="text"
                value={safeValues.receiverAddress}
                onChange={(e) => handleChange('receiverAddress', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>{t('step1.addressNext')}</label>
              <input
                type="text"
                value={safeValues.receiverAddress2}
                onChange={(e) => handleChange('receiverAddress2', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label>{t('step1.postalCode')} *</label>
              <input
                type="text"
                value={safeValues.receiverPostalCode}
                onChange={(e) => handleChange('receiverPostalCode', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>{t('step1.city')} *</label>
              <input
                type="text"
                value={safeValues.receiverCity}
                onChange={(e) => handleChange('receiverCity', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>{t('step1.country')} *</label>
              <select
                value={safeValues.receiverCountry}
                onChange={(e) => handleChange('receiverCountry', e.target.value)}
                required
              >
                <option value="">-- Sélectionnez un pays --</option>
                {countries.map((country) => (
                  <option key={country.id_country} value={country.symbol_fr}>
                    {country.symbol_fr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Numéro de téléphone *</label>
            <input
              type="tel"
              value={safeValues.receiverPhone}
              onChange={(e) => handleChange('receiverPhone', e.target.value)}
              required
            />
          </div>
        </>
      )}

      <hr />
      <div className="section-title">3/8 Origine de la marchandise</div>
      <div className="form-group">
        <label>Pays d'origine de la marchandise *</label>
        <select
          value={safeValues.goodsOrigin}
          onChange={(e) => handleChange('goodsOrigin', e.target.value)}
          required
        >
          <option value="">-- Sélectionnez un pays --</option>
          {countries.map((country) => (
            <option key={country.id_country} value={country.symbol_fr}>
              {country.symbol_fr}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Pays de destination de la marchandise *</label>
        <select
          value={safeValues.goodsDestination}
          onChange={(e) => handleChange('goodsDestination', e.target.value)}
          required
        >
          <option value="">-- Sélectionnez un pays --</option>
          {countries.map((country) => (
            <option key={country.id_country} value={country.symbol_fr}>
              {country.symbol_fr}
            </option>
          ))}
        </select>
      </div>

      <hr />
      <div className="section-title">4/8 Modes de transport</div>
      <div className="form-group">
        <label>Modes de transport</label>
        <div className="transport-options">
          {transportModes.map((mode) => (
            <label key={mode.id_transport_mode}>
              <input
                type="checkbox"
                checked={safeValues.transportModes[mode.symbol_eng.toLowerCase()] || false}
                onChange={(e) =>
                  handleChange('transportModes', {
                    ...safeValues.transportModes,
                    [mode.symbol_eng.toLowerCase()]: e.target.checked,
                  })
                }
              />{' '}
              {mode.symbol_fr}
            </label>
          ))}
        </div>
      </div>

      {/* Display the joined selected transport mode labels */}
      <div className="selected-transport-modes">
        <strong>Modes sélectionnés :</strong> {Object.keys(safeValues.transportModes)
          .filter((key) => safeValues.transportModes[key])
          .map((key) => key.charAt(0).toUpperCase() + key.slice(1))
          .join(', ') || 'Aucun mode sélectionné'}
      </div>

      <div className="form-group">
        <label>Remarques sur le transport</label>
        <textarea
          value={safeValues.transportRemarks}
          onChange={(e) => handleChange('transportRemarks', e.target.value)}
        />
      </div>

      <hr />
      <div className="section-title">5/8 Déscription des marchandises</div>
      <div className="form-group-row">
        <div className="form-group">
          <label>Référence / HSCODE</label>
          <input
            type="text"
            value={safeValues.boxReference}
            onChange={(e) => handleChange('boxReference', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Nature de la marchandise</label>
          <input
            type="text"
            value={safeValues.designation}
            onChange={(e) => handleChange('designation', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Quantité</label>
          <input
            type="number"
            value={safeValues.quantity}
            onChange={(e) => handleChange('quantity', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Unité</label>
          <select
            value={safeValues.unit}
            onChange={(e) => handleChange('unit', e.target.value)}
          >
            {unitWeights.map((unit) => (
              <option key={unit.id_unit_weight} value={unit.symbol_fr}>
                {unit.symbol_fr}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Référence document justificatif</label>
          <input
            type="text"
            value={safeValues.reference}
            onChange={(e) => handleChange('reference', e.target.value)}
          />
        </div>

        <div className="form-group button-group-inline">
          <button type="button" onClick={addMerchandise}>
            Ajouter la marchandise
          </button>
        </div>
      </div>

      {safeValues.merchandises && safeValues.merchandises.length > 0 && (
        <div className="dashboard-table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Désignation</th>
                <th>Référence</th>
                <th>Quantité</th>
                <th>Unité</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {safeValues.merchandises.map((merchandise, index) => (
                <tr key={index}>
                  <td>{merchandise.designation}</td>
                  <td>{merchandise.boxReference}</td>
                  <td>{merchandise.quantity}</td>
                  <td>{merchandise.unit}</td>
                  <td>
                    <button type="button" onClick={() => removeMerchandise(index)}>❌</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <hr />
      <div className="section-title">6/8 Nombre de copie certifié</div>
      <div className="form-group">
        <input
          type="number"
          value={safeValues.copies}
          onChange={(e) => handleChange('copies', e.target.value)}
          min="1"
          required
        />
      </div>

      <hr />
      <div className="section-title">7/8 Engagement</div>
      <p>
        En validant ces conditions générales d'utilisation vous demandez la délivrance du certificat d'origine
        pour les marchandises figurant en case 6, dont l'origine est indiquée en case 3.
      </p>
      <p>
        Vous vous engagez à ce que tous les éléments et renseignements fournis ainsi que les éventuelles pièces
        justificatives présentées soient exactes, que les marchandises auxquelles se rapportent ces renseignements
        soient celles pour lesquelles le certificat d'origine est demandé et que ces marchandises remplissent les
        conditions prévues par la réglementation relative à la définition de la notion d'origine des marchandises.
      </p>
      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={safeValues.isCommitted}
            onChange={(e) => handleChange('isCommitted', e.target.checked)}
          /> Je certifie m'engager dans les conditions décrites ci-dessus
        </label>
      </div>

      <hr />
      <div className="section-title">8/8 REMARQUES</div>
      <div className="form-group">
        <label>Remarques</label>
        <textarea
          value={safeValues.remarks}
          onChange={(e) => handleChange('remarks', e.target.value)}
          placeholder="Ajouter une remarque"
        />
      </div>
      <div className="character-counter">
        Caractère(s) restant(s) : {300 - (safeValues.remarks ? safeValues.remarks.length : 0)}
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <div className="button-group">
        <button type="button" className="previous-button">Retour</button>
        <button type="submit" className="submit-button">Enregistrer et continuer</button>
      </div>
    </form>
  );
};

export default Step2;