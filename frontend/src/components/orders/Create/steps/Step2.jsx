import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Step1.css'; // 
// Import des services
import {
  addOrUpdateGoods,
  addRecipient,
  createCertificate,
  fetchCountries,
  fetchRecipients,
  getCertifGoodsInfo,
  getTransmodeInfo,
  getUnitWeightInfo,
  setOrdCertifTranspMode,
} from '../../../../services/apiServices';

import { useSelector } from 'react-redux';

// FontAwesome (optionnel si vous utilisez ces icônes)
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faEdit, faTimes } from '@fortawesome/free-solid-svg-icons';

const Step2 = ({ nextStep, handleMerchandiseChange, handleChange, values = {} }) => {
  const { t } = useTranslation();

  // État : destinataire nouveau / existant
  const [isNewDestinataire, setIsNewDestinataire] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState('');

  // État(s) chargement + data
  const [recipients, setRecipients] = useState([]);
  const [countries, setCountries] = useState([]);
  const [transportModes, setTransportModes] = useState([]);
  const [unitWeights, setUnitWeights] = useState([]);

  // Loading / Erreur
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Contrôle d’édition par marchandise (true = édition, false = validé)
  const [merchEditStates, setMerchEditStates] = useState([]);

  // Accordéon : une seule section ouverte
  const [openSections, setOpenSections] = useState({
    section1: true,
    section2: false,
    section3: false,
    section4: false,
    section5: false,
    section6: false,
    section7: false,
    section8: false,
  });

  // Récupération du user
  const auth = useSelector((state) => state.auth);
  const user = auth?.user;
  const customerAccountId = user?.id_cust_account;

  // Query params
  const params = new URLSearchParams(location.search);
  const certifId = params.get('certifId');
  const orderId = params.get('orderId');

  // Champs obligatoires si destinataire nouveau ou existant
  const fieldsForNewRecipient = [
    'receiverName',
    'receiverAddress',
    'receiverPostalCode',
    'receiverCity',
    'receiverCountry',
    'receiverPhone',
  ];
  const fieldsForExistingRecipient = ['selectedRecipientId'];

  // Champs obligatoires par section
  const requiredFieldsBySectionBase = {
    section1: [],
    // section2 dépend de isNewDestinataire
    section3: ['goodsOrigin', 'goodsDestination'],
    section4: ['loadingPort', 'dischargingPort', 'transportModes'],
    section5: ['merchandises'], // Au moins 1
    section6: ['copies'],
    section7: ['isCommitted'],
    section8: [],
  };

  // Chargement initial
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Si certifId => on récupère ses marchandises
        if (certifId) {
          const goodsResponse = await getCertifGoodsInfo(certifId);
          const fetchedGoods = goodsResponse.data || [];
          // On stocke dans values.merchandises
          handleChange(
            'merchandises',
            fetchedGoods.map((good) => ({
              designation: good.goodDescription,
              boxReference: good.goodReferences,
              quantity: good.quantity,
              unit: good.unit || 'N/A',
              reference: '',
            }))
          );
          // On init l'état d'édition (ici on les met en non-éditable par défaut)
          setMerchEditStates(fetchedGoods.map(() => false));
        }

        // Récupère les pays
        const fetchedCountries = await fetchCountries();
        setCountries(fetchedCountries);

        // Récup modes transport
        const fetchedTransportModes = await getTransmodeInfo(null, true);
        setTransportModes(fetchedTransportModes.data);

        // Récup unités de poids
        const fetchedUnitWeights = await getUnitWeightInfo(null, true);
        const filteredUnitWeights = (fetchedUnitWeights.data || []).filter(
          (u) => u.id_unit_weight >= 1
        );
        setUnitWeights(filteredUnitWeights);
        


        // Unité par défaut si besoin
        if (!values.unit && filteredUnitWeights.length > 0) {
          const defaultUnit = filteredUnitWeights.find((u) => u.id_unit_weight === 1);
          if (defaultUnit) {
            handleChange('unit', defaultUnit.symbol_fr);
          }
        }

        // Destinataires (si pas de certifId)
        if (!certifId && customerAccountId) {
          const recipientFetched = await fetchRecipients({ idListCA: customerAccountId });
          setRecipients(recipientFetched.data);
          handleChange('recipients', recipientFetched.data);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setLoading(false);
        setError('Erreur lors du chargement des données.');
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [certifId, customerAccountId]);

  // Valeurs "safe"
  const safeValues = values || {
    goodsOrigin: '',
    goodsDestination: '',
    merchandises: [],
    remarks: '',
    copies: values.copies ?? '',
    isCommitted: false,
    transportModes: {},
  };

  // Fonction pour fermer/ouvrir une section à la fois
  const toggleSection = (sectionKey) => {
    setOpenSections((prev) => {
      const isCurrentlyOpen = prev[sectionKey];
      const allClosed = Object.keys(prev).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {});
      allClosed[sectionKey] = !isCurrentlyOpen;
      return allClosed;
    });
  };

  // Calcule le nombre de champs manquants pour une section
  const getMissingFieldsCount = (sectionKey) => {
    const config = { ...requiredFieldsBySectionBase };
    // Section2 dépend de isNewDestinataire
    const section2Fields = isNewDestinataire
      ? fieldsForNewRecipient
      : fieldsForExistingRecipient;
    config.section2 = section2Fields;

    let missingCount = 0;
    const fields = config[sectionKey] || [];

    fields.forEach((fieldName) => {
      if (fieldName === 'transportModes') {
        const isTransportSelected = Object.keys(safeValues.transportModes || {}).some(
          (k) => safeValues.transportModes[k]
        );
        if (!isTransportSelected) {
          missingCount += 1;
        }
      } else if (fieldName === 'merchandises') {
        if (!safeValues.merchandises || safeValues.merchandises.length === 0) {
          missingCount += 1;
        }
      } else if (!safeValues[fieldName]) {
        missingCount += 1;
      }
    });

    return missingCount;
  };

  // Ajoute une marchandise vide => en mode édition
  const createEmptyMerchLine = () => {
    const newItem = {
      designation: '',
      boxReference: '',
      quantity: '',
      unit: 'kilo',
      reference: '',
    };
    const updated = [...safeValues.merchandises, newItem];
    handleChange('merchandises', updated);
    // On rend la nouvelle ligne éditable
    setMerchEditStates((prev) => [...prev, true]);
  };

  // Bascule l'édition
  const toggleLineEdit = (index) => {
    setMerchEditStates((prev) => {
      const newStates = [...prev];
      newStates[index] = !newStates[index];
      return newStates;
    });
  };

  // Valider la ligne
  const validateLine = (index) => {
    const merch = safeValues.merchandises[index];
    // Vérif min : référence + nature
    if (!merch.boxReference || !merch.designation) {
      setErrorMessage("Veuillez remplir la référence/HSCODE et la nature avant de valider.");
      return;
    }
    // Tout va bien => on la passe en mode non-éditable
    setMerchEditStates((prev) => {
      const newStates = [...prev];
      newStates[index] = false;
      return newStates;
    });
  };

  // Supprime une marchandise
  const removeMerchandise = (index) => {
    const updated = safeValues.merchandises.filter((_, i) => i !== index);
    handleChange('merchandises', updated);
    const newStates = merchEditStates.filter((_, i) => i !== index);
    setMerchEditStates(newStates);
  };

  // Gère le changement d'un champ (référence, désignation, etc.)
  const handleMerchChange = (index, field, newValue) => {
    const updated = [...safeValues.merchandises];
    updated[index] = {
      ...updated[index],
      [field]: newValue,
    };
    handleChange('merchandises', updated);
  };

  // Soumission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Vérifs de base
    if (!safeValues.loadingPort) {
      setErrorMessage('Veuillez sélectionner un port de chargement.');
      return;
    }
    if (!safeValues.dischargingPort) {
      setErrorMessage('Veuillez sélectionner un port de déchargement.');
      return;
    }
    const isTransportSelected = Object.keys(safeValues.transportModes || {}).some(
      (k) => safeValues.transportModes[k]
    );
    if (!isTransportSelected) {
      setErrorMessage('Veuillez sélectionner au moins un mode de transport.');
      return;
    }
    if (safeValues.merchandises.length === 0) {
      setErrorMessage('Veuillez ajouter au moins une marchandise.');
      return;
    }

    // Vérifier que toutes les lignes ne sont pas en édition
    if (merchEditStates.some((st) => st === true)) {
      setErrorMessage(
        "Certaines lignes de marchandise ne sont pas validées. Cliquez sur 'Valider' avant de continuer."
      );
      return;
    }

    // Gérer la création d'un nouveau destinataire si besoin
    let recipientId = selectedRecipient;
    if (isNewDestinataire) {
      try {
        const newRecipientData = {
          idRecipientAccount: null,
          idCustAccount: customerAccountId,
          recipientName: safeValues.receiverName,
          address1: safeValues.receiverAddress,
          address2: safeValues.receiverAddress2,
          address3: safeValues.receiverPostalCode,
          idCity: 1,
          statutFlag: 1,
          activationDate: new Date().toISOString(),
          deactivationDate: new Date('9999-12-31').toISOString(),
          idLoginInsert: user?.id_login_user || 1,
          idLoginModify: null,
        };
        const recipientResponse = await addRecipient(newRecipientData);
        recipientId = recipientResponse?.newRecipientId;
        const updatedRecipientsResponse = await fetchRecipients({ idListCA: customerAccountId });
        setRecipients(updatedRecipientsResponse.data);
        handleChange('recipients', updatedRecipientsResponse.data);

        setSelectedRecipient(recipientId);
        handleChange('selectedRecipientId', recipientId);
      } catch (err) {
        console.error('Erreur creation recipient :', err);
        setErrorMessage('Erreur lors de la création du nouveau destinataire.');
        return;
      }
    }

    // Convert pays -> id
    const getCountryId = (countryName) => {
      const found = countries.find((c) => c.symbol_fr === countryName);
      return found ? found.id_country : null;
    };

    try {
      // createCertificate
      const certData = {
        idOrder: safeValues.orderId,
        idRecipientAccount: recipientId,
        idCountryOrigin: getCountryId(safeValues.goodsOrigin),
        idCountryDestination: getCountryId(safeValues.goodsDestination),
        notes: safeValues.remarks,
        idCountryPortLoading: getCountryId(safeValues.loadingPort),
        idCountryPortDischarge: getCountryId(safeValues.dischargingPort),
        copyCount: safeValues.copies,
        idLoginInsert: user?.id_login_user || 1,
        transportRemarks: safeValues.transportRemarks,
      };
      const certResponse = await createCertificate(certData);

      if (!certResponse.newCertifId) {
        throw new Error("La réponse du serveur ne contient pas 'newCertifId'.");
      }

      // Ajouter les marchandises
      for (const merchandise of safeValues.merchandises) {
        if (!merchandise.boxReference || !merchandise.designation) {
          throw new Error("Référence/HSCODE et Nature sont obligatoires pour chaque marchandise.");
        }
        const normalizeText = (txt) => (txt || '').toLowerCase().trim();
        const matchedUnit = unitWeights.find(
          (u) => normalizeText(u.symbol_fr) === normalizeText(merchandise.unit)
        );
        if (!matchedUnit) {
          throw new Error(`Unité '${merchandise.unit}' inconnue.`);
        }

        const goodsData = {
          idOrdCertifOri: certResponse.newCertifId,
          goodDescription: merchandise.designation,
          goodReferences: merchandise.boxReference,
          weight_qty: merchandise.quantity,
          idUnitWeight: matchedUnit.id_unit_weight,
        };
        await addOrUpdateGoods(goodsData);
      }

      // setOrdCertifTranspMode
      const selectedModeKeys = Object.keys(safeValues.transportModes || {}).filter(
        (k) => safeValues.transportModes[k]
      );
      for (const key of selectedModeKeys) {
        const matched = transportModes.find((tm) => tm.symbol_eng.toLowerCase() === key);
        if (matched) {
          await setOrdCertifTranspMode({
            id_ord_certif_transp_mode: null,
            id_ord_certif_ori: certResponse.newCertifId,
            id_transport_mode: matched.id_transport_mode,
          });
        }
      }

      setErrorMessage('');
      nextStep();
    } catch (err) {
      console.error('Erreur lors de la création du certificat ou marchandises:', err);
      setErrorMessage(err.message || "Une erreur est survenue lors de l'enregistrement.");
    }
  };

  if (loading) return <div>Chargement en cours...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <form onSubmit={handleSubmit} className="step-form">
      {/* SECTION 1/8 : DEMANDEUR */}
      <div className="collapsible-section">
        <div className="collapsible-header" onClick={() => toggleSection('section1')}>
          <span className="section-title">
            1/8 DEMANDEUR {openSections.section1 ? '▼' : '►'}
          </span>
        </div>
        {openSections.section1 && (
          <div className="collapsible-content">
            <div className="exporter-name-container">
              <p className="exporter-name">{user?.companyname}</p>
            </div>
          </div>
        )}
      </div>
      <hr />

      {/* SECTION 2/8 : DESTINATAIRE */}
      <div className="collapsible-section">
        <div className="collapsible-header" onClick={() => toggleSection('section2')}>
          <span className="section-title">
            2/8 DESTINATAIRE {openSections.section2 ? '▼' : '►'}
            {` (champs manquants : ${getMissingFieldsCount('section2')})`}
          </span>
        </div>
        {openSections.section2 && (
          <div className="collapsible-content">
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

                    // Trouver le destinataire
                    const r = recipients.find(
                      (rec) => rec.id_recipient_account.toString() === selectedId
                    );
                    if (r) {
                      handleChange('receiverName', r.recipient_name);
                      handleChange('receiverAddress', r.address_1);
                      handleChange('receiverAddress2', r.address_2);
                      handleChange('receiverPostalCode', r.address_3);
                      handleChange('receiverCity', r.city_symbol_fr_recipient);
                      handleChange('receiverCountry', r.country_symbol_fr_recipient);
                      handleChange('receiverPhone', r.trade_registration_num);
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
                      value={safeValues.receiverName || ''}
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
                      value={safeValues.receiverAddress || ''}
                      onChange={(e) => handleChange('receiverAddress', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('step1.addressNext')}</label>
                    <input
                      type="text"
                      value={safeValues.receiverAddress2 || ''}
                      onChange={(e) => handleChange('receiverAddress2', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label>{t('step1.postalCode')} *</label>
                    <input
                      type="text"
                      value={safeValues.receiverPostalCode || ''}
                      onChange={(e) => handleChange('receiverPostalCode', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('step1.city')} *</label>
                    <input
                      type="text"
                      value={safeValues.receiverCity || ''}
                      onChange={(e) => handleChange('receiverCity', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('step1.country')} *</label>
                    <select
                      value={safeValues.receiverCountry || ''}
                      onChange={(e) => handleChange('receiverCountry', e.target.value)}
                      required
                    >
                      <option value="">-- Sélectionnez un pays --</option>
                      {countries.map((c) => (
                        <option key={c.id_country} value={c.symbol_fr}>
                          {c.symbol_fr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Numéro de téléphone *</label>
                  <input
                    type="tel"
                    value={safeValues.receiverPhone || ''}
                    onChange={(e) => handleChange('receiverPhone', e.target.value)}
                    required
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <hr />

      {/* SECTION 3/8 : ORIGINE */}
      <div className="collapsible-section">
        <div className="collapsible-header" onClick={() => toggleSection('section3')}>
          <span className="section-title">
            3/8 ORIGINE {openSections.section3 ? '▼' : '►'}
            {` (champs manquants : ${getMissingFieldsCount('section3')})`}
          </span>
        </div>
        {openSections.section3 && (
          <div className="collapsible-content">
            <div className="form-group">
              <label>Pays d'origine de la marchandise *</label>
              <select
                value={safeValues.goodsOrigin || ''}
                onChange={(e) => handleChange('goodsOrigin', e.target.value)}
                required
              >
                <option value="">-- Sélectionnez un pays --</option>
                {countries.map((c) => (
                  <option key={c.id_country} value={c.symbol_fr}>
                    {c.symbol_fr}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Pays de destination de la marchandise *</label>
              <select
                value={safeValues.goodsDestination || ''}
                onChange={(e) => handleChange('goodsDestination', e.target.value)}
                required
              >
                <option value="">-- Sélectionnez un pays --</option>
                {countries.map((c) => (
                  <option key={c.id_country} value={c.symbol_fr}>
                    {c.symbol_fr}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
      <hr />

      {/* SECTION 4/8 : TRANSPORT */}
      <div className="collapsible-section">
        <div className="collapsible-header" onClick={() => toggleSection('section4')}>
          <span className="section-title">
            4/8 MODES DE TRANSPORT {openSections.section4 ? '▼' : '►'}
            {` (champs manquants : ${getMissingFieldsCount('section4')})`}
          </span>
        </div>
        {openSections.section4 && (
          <div className="collapsible-content">
            <div className="form-group-row">
              <div className="form-group">
                <label>
                  Port de chargement <span className="required">*</span>
                </label>
                <select
                  value={safeValues.loadingPort || ''}
                  onChange={(e) => handleChange('loadingPort', e.target.value)}
                  required
                >
                  <option value="">-- Sélectionnez un pays --</option>
                  {countries.map((c) => (
                    <option key={c.id_country} value={c.symbol_fr}>
                      {c.symbol_fr}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>
                  Port de déchargement <span className="required">*</span>
                </label>
                <select
                  value={safeValues.dischargingPort || ''}
                  onChange={(e) => handleChange('dischargingPort', e.target.value)}
                  required
                >
                  <option value="">-- Sélectionnez un pays --</option>
                  {countries.map((c) => (
                    <option key={c.id_country} value={c.symbol_fr}>
                      {c.symbol_fr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Modes de transport</label>
              <div className="transport-options">
                {transportModes.map((mode) => (
                  <label key={mode.id_transport_mode}>
                    <input
                      type="checkbox"
                      checked={
                        safeValues.transportModes[mode.symbol_eng.toLowerCase()] || false
                      }
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

            <div className="form-group">
              <label>Remarques sur le transport</label>
              <textarea
                value={safeValues.transportRemarks || ''}
                onChange={(e) => handleChange('transportRemarks', e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
      <hr />

      {/* SECTION 5/8 : MARCHANDISES */}
      <div className="collapsible-section">
        <div className="collapsible-header" onClick={() => toggleSection('section5')}>
          <span className="section-title">
            5/8 MARCHANDISES {openSections.section5 ? '▼' : '►'}
            {` (champs manquants : ${getMissingFieldsCount('section5')})`}
          </span>
        </div>
        {openSections.section5 && (
          <div className="collapsible-content">
            {/* Bouton pour ajouter une marchandise vide */}
            <button type="button" className="add-merchandise-btn" onClick={createEmptyMerchLine}>
              Ajouter la marchandise
            </button>

            {/* Liste des marchandises */}
            {safeValues.merchandises.map((m, index) => {
              const isEditable = merchEditStates[index] || false;
              return (
                <div key={index} className="merch-line">
                  <div className="form-group-row" style={{ alignItems: 'center' }}>
                    <div className="form-group">
                      <label>Référence / HSCODE</label>
                      <input
                        type="text"
                        disabled={!isEditable}
                        value={m.boxReference}
                        onChange={(e) => handleMerchChange(index, 'boxReference', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Nature</label>
                      <input
                        type="text"
                        disabled={!isEditable}
                        value={m.designation}
                        onChange={(e) => handleMerchChange(index, 'designation', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Quantité</label>
                      <input
                        type="number"
                        disabled={!isEditable}
                        value={m.quantity === '' ? '' : m.quantity}
                        onChange={(e) => {
                          // Si e.target.value est vide, on reste vide
                          if (e.target.value === '') {
                            handleMerchChange(index, 'quantity', '');
                          } else {
                            // Sinon on peut parser la valeur
                            const parsed = parseFloat(e.target.value);
                            // On peut vérifier que ce n’est pas NaN
                            if (!isNaN(parsed)) {
                              handleMerchChange(index, 'quantity', parsed);
                            }
                          }
                        }}
                      />

                    </div>

                    <div className="form-group">
                      <label>Unité</label>
                      <select
                        disabled={!isEditable}
                        value={m.unit}
                        onChange={(e) => handleMerchChange(index, 'unit', e.target.value)}
                      >
                        {unitWeights.map((u) => (
                          <option key={u.id_unit_weight} value={u.symbol_fr}>
                            {u.symbol_fr}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Référence doc. justificatif</label>
                      <input
                        type="text"
                        disabled={!isEditable}
                        value={m.reference || ''}
                        onChange={(e) => handleMerchChange(index, 'reference', e.target.value)}
                      />
                    </div>

                    <div className="merch-actions">
                      {isEditable ? (
                        // Bouton Valider
                        <button
                          type="button"
                          className="merch-icon-btn merch-icon-validate"
                          onClick={() => validateLine(index)}
                        >
                          <FontAwesomeIcon icon={faCheck} />
                        </button>
                      ) : (
                        // Bouton Modifier
                        <button
                          type="button"
                          className="merch-icon-btn"
                          onClick={() => toggleLineEdit(index)}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                      )}

                      <button
                        type="button"
                        className="merch-icon-btn merch-icon-delete"
                        onClick={() => removeMerchandise(index)}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <hr />

      {/* SECTION 6/8 : NOMBRE DE COPIES */}
      <div className="collapsible-section">
        <div className="collapsible-header" onClick={() => toggleSection('section6')}>
          <span className="section-title">
            6/8 NOMBRE DE COPIES {openSections.section6 ? '▼' : '►'}
            {` (champs manquants : ${getMissingFieldsCount('section6')})`}
          </span>
        </div>
        {openSections.section6 && (
          <div className="collapsible-content">
            <div className="form-group">
              <label>Combien de copies certifiées ?</label>
              <input
                type="number"
                value={safeValues.copies === '' ? '' : safeValues.copies}
                onChange={(e) => {
                  // Si vide, on stocke une chaîne vide
                  if (e.target.value === '') {
                    handleChange('copies', '');
                  } else {
                    // Sinon, on essaie de parser un nombre
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) {
                      handleChange('copies', val);
                    }
                  }
                }}
                min="1"
                required
              />
            </div>
          </div>
        )}
      </div>
      <hr />

      {/* SECTION 7/8 : ENGAGEMENT */}
      <div className="collapsible-section">
        <div className="collapsible-header" onClick={() => toggleSection('section7')}>
          <span className="section-title">
            7/8 ENGAGEMENT {openSections.section7 ? '▼' : '►'}
            {` (champs manquants : ${getMissingFieldsCount('section7')})`}
          </span>
        </div>
        {openSections.section7 && (
          <div className="collapsible-content">
            <p>
              En validant ces conditions générales d'utilisation vous demandez la délivrance
              du certificat d'origine pour les marchandises figurant en case 6, dont l'origine
              est indiquée en case 3.
            </p>
            <p>
              Vous vous engagez à ce que tous les éléments et renseignements fournis ainsi que
              les éventuelles pièces justificatives présentées soient exactes, que les marchandises
              auxquelles se rapportent ces renseignements soient celles pour lesquelles le certificat
              d'origine est demandé et que ces marchandises remplissent les conditions prévues par
              la réglementation relative à la définition de la notion d'origine des marchandises.
            </p>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={safeValues.isCommitted || false}
                  onChange={(e) => handleChange('isCommitted', e.target.checked)}
                />{' '}
                Je certifie m'engager dans les conditions décrites ci-dessus
              </label>
            </div>
          </div>
        )}
      </div>
      <hr />

      {/* SECTION 8/8 : REMARQUES */}
      <div className="collapsible-section">
        <div className="collapsible-header" onClick={() => toggleSection('section8')}>
          <span className="section-title">
            8/8 REMARQUES {openSections.section8 ? '▼' : '►'}
          </span>
        </div>
        {openSections.section8 && (
          <div className="collapsible-content">
            <div className="form-group">
              <textarea
                value={safeValues.remarks || ''}
                onChange={(e) => handleChange('remarks', e.target.value)}
                placeholder="Ajouter une remarque"
              />
            </div>
            <div className="character-counter">
              Caractère(s) restant(s) : {300 - (safeValues.remarks?.length ?? 0)}
            </div>
          </div>
        )}
      </div>

      {/* Erreur globale */}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <div className="button-group">
        <button type="button" className="previous-button">
          Retour
        </button>
        <button type="submit" className="submit-button">
          Enregistrer et continuer
        </button>
      </div>
    </form>
  );
};

export default Step2;
