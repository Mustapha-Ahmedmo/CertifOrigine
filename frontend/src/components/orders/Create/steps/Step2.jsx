import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Step1.css';
import { addOrUpdateGoods, addRecipient, createCertificate, fetchCountries, fetchRecipients, getTransmodeInfo, getUnitWeightInfo } from '../../../../services/apiServices';
import { useSelector } from 'react-redux';

const Step2 = ({ nextStep, handleMerchandiseChange, handleChange, values }) => {
  const { t } = useTranslation();
  const [isNewDestinataire, setIsNewDestinataire] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [recipients, setRecipients] = useState([]); // State for actual recipients
  const [selectedRecipient, setSelectedRecipient] = useState(''); // Selected reci
  const [selectedFakeCompany, setSelectedFakeCompany] = useState('');

  const [countries, setCountries] = useState([]); // State for countries
  const [transportModes, setTransportModes] = useState([]); // State for transport modes
  const [unitWeights, setUnitWeights] = useState([]); // State for unit weights

  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  const auth = useSelector((state) => state.auth); // Access user data from Redux
  const customerAccountId = auth?.user?.id_cust_account; // Customer Account ID from the logged-in user

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Fetch countries
        const fetchedCountries = await fetchCountries();
        setCountries(fetchedCountries);

        // Fetch transport modes
        const fetchedTransportModes = await getTransmodeInfo(null, true);
        setTransportModes(fetchedTransportModes.data);

        // Fetch unit weights
        const fetchedUnitWeights = await getUnitWeightInfo(null, true);
        setUnitWeights(fetchedUnitWeights.data);

        // Fetch recipients
        if (customerAccountId) {
          const recipientFetched = await fetchRecipients({
            idListCA: customerAccountId, // Fetch recipients by customer account ID
          });
          setRecipients(recipientFetched.data);
          console.log(recipientFetched)
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, [customerAccountId]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1) Validate transport modes
    const isTransportSelected = transportModes.some(
      (mode) => values.transportModes[mode.symbol_eng.toLowerCase()]
    );
    if (!isTransportSelected) {
      setErrorMessage('Veuillez sélectionner au moins un mode de transport.');
      return;
    }

    // 2) Validate merchandise
    if (values.merchandises.length === 0) {
      setErrorMessage('Veuillez ajouter au moins une marchandise.');
      return;
    }

    let recipientId = selectedRecipient; // Default to selected recipient ID


    // 3) If user wants to create a new recipient (destinataire)
    if (isNewDestinataire) {
      try {
        // Build data object for the new recipient
        const newRecipientData = {
          idRecipientAccount: null,
          idCustAccount: customerAccountId,
          recipientName: values.receiverName,
          address1: values.receiverAddress,
          address2: values.receiverAddress2,
          address3: values.receiverPostalCode,
          idCity: 1, // Or the correct city ID
          statutFlag: 1,
          activationDate: new Date().toISOString(),
          deactivationDate: new Date('9999-12-31').toISOString(), // Default future date
          idLoginInsert: auth?.user?.id_login_user || 1,
          idLoginModify: null,
        };

        const recipientResponse = await addRecipient(newRecipientData);
        console.log(recipientResponse);
        recipientId = recipientResponse?.newRecipientId; // Capture new ID
        console.log(recipientId);
        console.log('New recipient created successfully!');
      } catch (error) {
        console.error('Error creating new recipient:', error);
        setErrorMessage(
          "Erreur lors de la création du nouveau destinataire. Veuillez réessayer."
        );
        return; // Stop here if creation failed
      }
    }

    // Convert country names to country IDs
    const getCountryId = (countryName) => {
      const foundCountry = countries.find(country => country.symbol_fr === countryName);
      return foundCountry ? foundCountry.id_country : null;
    };

    const certData = {
      idOrder: values.orderId, // Ensure order ID is available
      idRecipientAccount: recipientId,
      idCountryOrigin: getCountryId(values.goodsOrigin),  // Convert to ID
      idCountryDestination: getCountryId(values.goodsDestination),  // Convert to ID
      notes: values.remarks,
      copyCount: values.copies,
      idLoginInsert: auth?.user?.id_login_user || 1,
      transportRemarks: values.transportRemarks,
    };

    const certResponse = await createCertificate(certData);
    console.log('Certificate created successfully:', certResponse);


    for (const merchandise of values.merchandises) {
      try {

        const normalizeText = (text) => text.toLowerCase().trim();

        const matchedUnit = unitWeights.find(
          (unit) => normalizeText(unit.symbol_fr) === normalizeText(merchandise.unit)
        );
        const goodsData = {
          idOrdCertifOri: certResponse.newCertifId, // Use the newly created certificate ID
          goodDescription: merchandise.designation,
          goodReferences: merchandise.boxReference,
          idUnitWeight: unitWeights.find((unit) => unit.symbol_fr === merchandise.unit)?.id_unit_weight || null,
        };

        console.log("Merchandise => ", merchandise);

        const goodsResponse = await addOrUpdateGoods(goodsData);
        console.log('Goods added successfully:', goodsResponse);
      } catch (error) {
        console.error('Error adding goods:', error);
        setErrorMessage("Erreur lors de l'ajout des marchandises. Veuillez réessayer.");
        return;
      }
    }

    // 4) If everything is okay, proceed to next step
    setErrorMessage('');
    nextStep();
  };
  const addMerchandise = () => {
    if (!values.designation || !values.quantity || !values.boxReference) return;

    const newMerchandise = {
      designation: values.designation,
      boxReference: values.boxReference,
      quantity: values.quantity,
      unit: values.unit,
    };

    handleMerchandiseChange(newMerchandise);

    handleChange('designation', '');
    handleChange('quantity', '');
    handleChange('boxReference', '');
    handleChange('unit', 'kg');
  };

  const removeMerchandise = (index) => {
    const updatedMerchandises = values.merchandises.filter((_, i) => i !== index);
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

              // Find the selected recipient
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
                handleChange('receiverPhone', recipient.trade_registration_num); // Replace this with the appropriate phone field if available
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
                value={values.receiverName}
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
                value={values.receiverAddress}
                onChange={(e) => handleChange('receiverAddress', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>{t('step1.addressNext')}</label>
              <input
                type="text"
                value={values.receiverAddress2}
                onChange={(e) => handleChange('receiverAddress2', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label>{t('step1.postalCode')} *</label>
              <input
                type="text"
                value={values.receiverPostalCode}
                onChange={(e) => handleChange('receiverPostalCode', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>{t('step1.city')} *</label>
              <input
                type="text"
                value={values.receiverCity}
                onChange={(e) => handleChange('receiverCity', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>{t('step1.country')} *</label>
              <select
                value={values.receiverCountry}
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
              value={values.receiverPhone}
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
          value={values.goodsOrigin}
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
          value={values.goodsDestination}
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
                checked={values.transportModes[mode.symbol_eng.toLowerCase()] || false}
                onChange={(e) =>
                  handleChange('transportModes', {
                    ...values.transportModes,
                    [mode.symbol_eng.toLowerCase()]: e.target.checked,
                  })
                }
              />{' '}
              {mode.symbol_fr}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Remarques sur le transport</label>
        <textarea
          value={values.transportRemarks}
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
            value={values.boxReference}
            onChange={(e) => handleChange('boxReference', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Nature de la marchandise</label>
          <input
            type="text"
            value={values.designation}
            onChange={(e) => handleChange('designation', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Quantité</label>
          <input
            type="number"
            value={values.quantity}
            onChange={(e) => handleChange('quantity', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Unité</label>
          <select
            value={values.unit}
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
            value={values.reference}
            onChange={(e) => handleChange('reference', e.target.value)}
          />
        </div>

        <div className="form-group button-group-inline">
          <button type="button" onClick={addMerchandise}>
            Ajouter la marchandise
          </button>
        </div>
      </div>

      {values.merchandises.length > 0 && (
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
              {values.merchandises.map((merchandise, index) => (
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
          value={values.copies}
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
            checked={values.isCommitted}
            onChange={(e) => handleChange('isCommitted', e.target.checked)}
          /> Je certifie m'engager dans les conditions décrites ci-dessus
        </label>
      </div>

      <hr />
      <div className="section-title">8/8 REMARQUES</div>
      <div className="form-group">
        <label>Remarques</label>
        <textarea
          value={values.remarks}
          onChange={(e) => handleChange('remarks', e.target.value)}
          placeholder="Ajouter une remarque"
        />
      </div>
      <div className="character-counter">
        Caractère(s) restant(s) : {300 - (values.remarks ? values.remarks.length : 0)}
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
