import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Step1.css'; // Conserve vos CSS existants
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faEdit, faTimes } from '@fortawesome/free-solid-svg-icons';
import Slide from '@mui/material/Slide';

// Composants Material‑UI utilisés dans ce composant
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Alert from '@mui/material/Alert';

// Nouveaux imports pour la section ENGAGEMENT
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';

const customFieldStyle = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: '#DDAF26' },
    '&:hover fieldset': { borderColor: '#DDAF26' },
    '&.Mui-focused fieldset': { borderColor: '#DDAF26' },
  },
  '& label.Mui-focused': { color: '#DDAF26' },
};

const customButtonStyle = {
  backgroundColor: '#DDAF26',
  '&:hover': { backgroundColor: '#DDAF26' },
};

const Step2 = ({ nextStep, prevStep, handleMerchandiseChange, handleChange, values = {} }) => {
  const { t } = useTranslation();

  // États existants
  const [isNewDestinataire, setIsNewDestinataire] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [recipients, setRecipients] = useState([]);
  const [countries, setCountries] = useState([]);
  const [transportModes, setTransportModes] = useState([]);
  const [unitWeights, setUnitWeights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [merchEditStates, setMerchEditStates] = useState([]);

  // Navigation multi-sections
  const totalSections = 8; // Sections de 1/8 à 8/8
  const [currentSection, setCurrentSection] = useState(0);
  const [slideDirection, setSlideDirection] = useState('left');

  // Récupération de l'utilisateur depuis Redux
  const auth = useSelector((state) => state.auth);
  const user = auth?.user;
  const customerAccountId = user?.id_cust_account;

  // Query params
  const params = new URLSearchParams(location.search);
  const certifId = params.get('certifId');
  const orderId = params.get('orderId');

  // Champs obligatoires pour destinataire
  const fieldsForNewRecipient = [
    'receiverName',
    'receiverAddress',
    'receiverPostalCode',
    'receiverCity',
    'receiverCountry',
    'receiverPhone',
  ];
  const fieldsForExistingRecipient = ['selectedRecipientId'];

  // Mapping des champs obligatoires par section
  const sectionConfig = {
    0: [], // DEMANDEUR (déjà rempli)
    1: isNewDestinataire ? fieldsForNewRecipient : fieldsForExistingRecipient, // DESTINATAIRE
    2: ['goodsOrigin', 'goodsDestination'], // ORIGINE
    3: ['loadingPort', 'dischargingPort', 'transportModes'], // TRANSPORT
    4: ['merchandises'], // MARCHANDISES
    5: ['copies'], // NOMBRE DE COPIES
    6: ['isCommitted'], // ENGAGEMENT
    7: [] // REMARQUES
  };

  // Messages d'erreur spécifiques par section (en fonction de currentSection)
  const errorMessages = {
    1: "Veuillez choisir ou saisir un destinataire.",
    2: "Veuillez choisir le pays d'origine et de destination de la marchandise.",
    3: "Veuillez sélectionner les ports et au moins un mode de transport.",
    4: "Veuillez ajouter et valider au moins une marchandise.",
    5: "Veuillez renseigner le nombre de copies certifiées.",
    6: "Veuillez certifier votre engagement.",
    // Pour la section 8/8 (index 7) il n'y a pas de champ obligatoire.
  };

  // Chargement initial des données
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        if (certifId) {
          const goodsResponse = await getCertifGoodsInfo(certifId);
          const fetchedGoods = goodsResponse.data || [];
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
          setMerchEditStates(fetchedGoods.map(() => false));
        }

        const fetchedCountries = await fetchCountries();
        setCountries(fetchedCountries);

        const fetchedTransportModes = await getTransmodeInfo(null, true);
        setTransportModes(fetchedTransportModes.data);

        const fetchedUnitWeights = await getUnitWeightInfo(null, true);
        const filteredUnitWeights = (fetchedUnitWeights.data || []).filter(
          (u) => u.id_unit_weight >= 1
        );
        setUnitWeights(filteredUnitWeights);
        if (!values.unit && filteredUnitWeights.length > 0) {
          const defaultUnit = filteredUnitWeights.find((u) => u.id_unit_weight === 1);
          if (defaultUnit) {
            handleChange('unit', defaultUnit.symbol_fr);
          }
        }

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
  }, [certifId, customerAccountId]);

  const safeValues = values || {
    goodsOrigin: '',
    goodsDestination: '',
    merchandises: [],
    remarks: '',
    copies: values.copies ?? '',
    isCommitted: false,
    transportModes: {},
  };

  // Calcul du nombre de champs manquants pour la section courante
  const getMissingFieldsCount = () => {
    const fields = sectionConfig[currentSection] || [];
    let missingCount = 0;
    fields.forEach((fieldName) => {
      if (fieldName === 'transportModes') {
        const isTransportSelected = Object.keys(safeValues.transportModes || {}).some(
          (k) => safeValues.transportModes[k]
        );
        if (!isTransportSelected) missingCount += 1;
      } else if (fieldName === 'merchandises') {
        if (!safeValues.merchandises || safeValues.merchandises.length === 0) missingCount += 1;
      } else if (!safeValues[fieldName]) {
        missingCount += 1;
      }
    });
    return missingCount;
  };

  // Navigation entre sections avec validation des champs obligatoires
  const nextSection = () => {
    // Vérification spécifique pour la section 4 (MARCHANDISES)
    if (currentSection === 4) {
      if (merchEditStates.some((state) => state)) {
        setErrorMessage("Certaines lignes de marchandise ne sont pas validées. Veuillez remplir tous les champs et cliquer sur 'Valider' avant de continuer.");
        return;
      }
    }
    // Pour toutes les sections sauf 1/8 (index 0) déjà remplies, on vérifie que tous les champs obligatoires sont remplis.
    if (currentSection !== 0) {
      const missing = getMissingFieldsCount();
      if (missing > 0) {
        const msg = errorMessages[currentSection] || "Veuillez remplir tous les champs obligatoires de cette section.";
        setErrorMessage(msg);
        return;
      }
    }
    // Si tous les champs sont remplis, on passe à la section suivante et on efface l'erreur.
    setErrorMessage('');
    setSlideDirection('left');
    if (currentSection < totalSections - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      nextStep();
    }
  };

  const prevSection = () => {
    setSlideDirection('right');
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  // Gestion des marchandises
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
    setMerchEditStates((prev) => [...prev, true]);
  };

  const toggleLineEdit = (index) => {
    setMerchEditStates((prev) => {
      const newStates = [...prev];
      newStates[index] = !newStates[index];
      return newStates;
    });
  };

  const validateLine = (index) => {
    const merch = safeValues.merchandises[index];
    if (!merch.boxReference || !merch.designation) {
      setErrorMessage("Veuillez remplir la référence/HSCODE et la nature avant de valider.");
      return;
    }
    setMerchEditStates((prev) => {
      const newStates = [...prev];
      newStates[index] = false;
      return newStates;
    });
  };

  const removeMerchandise = (index) => {
    const updated = safeValues.merchandises.filter((_, i) => i !== index);
    handleChange('merchandises', updated);
    const newStates = merchEditStates.filter((_, i) => i !== index);
    setMerchEditStates(newStates);
  };

  const handleMerchChange = (index, field, newValue) => {
    const updated = [...safeValues.merchandises];
    updated[index] = { ...updated[index], [field]: newValue };
    handleChange('merchandises', updated);
  };

  // Navigation locale : retour à Step1 si currentSection est 0
  const onBack = () => {
    if (currentSection === 0) {
      prevStep();
    } else {
      setSlideDirection('right');
      setCurrentSection(currentSection - 1);
    }
  };

  // Soumission finale
  const handleSubmit = async (e) => {
    e.preventDefault();
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
    if (merchEditStates.some((st) => st === true)) {
      setErrorMessage("Certaines lignes de marchandise ne sont pas validées. Cliquez sur 'Valider' avant de continuer.");
      return;
    }

    // Traitement destinataire et certificat
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
        console.error('Erreur création destinataire :', err);
        setErrorMessage('Erreur lors de la création du nouveau destinataire.');
        return;
      }
    }

    const getCountryId = (countryName) => {
      const found = countries.find((c) => c.symbol_fr === countryName);
      return found ? found.id_country : null;
    };

    try {
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

  // Rendu des sections en fonction de currentSection
  const renderSection = () => {
    switch (currentSection) {
      case 0:
        return (
          <div>
            <div className="collapsible-header">
              <span className="section-title">1/8 DEMANDEUR</span>
            </div>
            <div className="collapsible-content">
              <Box sx={{ p: 2 }}>
                <TextField
                  label="Nom de l'entreprise"
                  variant="outlined"
                  value={user?.companyname || ''}
                  fullWidth
                  disabled
                  sx={{ ...customFieldStyle }}
                />
              </Box>
            </div>
          </div>
        );
      case 1:
        return (
          <div>
            <div className="collapsible-header">
              <span className="section-title">2/8 DESTINATAIRE</span>
            </div>
            <div className="collapsible-content">
              <FormControl component="fieldset" sx={{ mb: 2 }}>
                <RadioGroup
                  row
                  defaultValue="choisir"
                  onChange={(e) => setIsNewDestinataire(e.target.value === 'saisir')}
                >
                  <FormControlLabel
                    value="choisir"
                    control={<Radio sx={{ color: '#DDAF26', '&.Mui-checked': { color: '#DDAF26' } }} />}
                    label={t('step1.chooseReceiver')}
                  />
                  <FormControlLabel
                    value="saisir"
                    control={<Radio sx={{ color: '#DDAF26', '&.Mui-checked': { color: '#DDAF26' } }} />}
                    label={t('step1.enterNewReceiver')}
                  />
                </RadioGroup>
              </FormControl>
              {!isNewDestinataire ? (
                <FormControl fullWidth variant="outlined" sx={{ mb: 2, ...customFieldStyle }}>
                  <InputLabel id="destinataire-select-label">
                    Choisir une entreprise *
                  </InputLabel>
                  <Select
                    labelId="destinataire-select-label"
                    value={selectedRecipient}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      setSelectedRecipient(selectedId);
                      handleChange('selectedRecipientId', selectedId);
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
                    label="Choisir une entreprise *"
                  >
                    <MenuItem value="">
                      <em>-- Sélectionnez une entreprise --</em>
                    </MenuItem>
                    {recipients.map((recipient) => (
                      <MenuItem
                        key={recipient.id_recipient_account}
                        value={recipient.id_recipient_account}
                      >
                        {recipient.recipient_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <>
                  <TextField
                    label={`${t('step1.companyName')} *`}
                    fullWidth
                    value={safeValues.receiverName || ''}
                    onChange={(e) => handleChange('receiverName', e.target.value)}
                    sx={{ mb: 2, ...customFieldStyle }}
                  />
                  <TextField
                    label={`${t('step1.address')} *`}
                    fullWidth
                    value={safeValues.receiverAddress || ''}
                    onChange={(e) => handleChange('receiverAddress', e.target.value)}
                    sx={{ mb: 2, ...customFieldStyle }}
                  />
                  <TextField
                    label={t('step1.addressNext')}
                    fullWidth
                    value={safeValues.receiverAddress2 || ''}
                    onChange={(e) => handleChange('receiverAddress2', e.target.value)}
                    sx={{ mb: 2, ...customFieldStyle }}
                  />
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                      label={`${t('step1.postalCode')} *`}
                      fullWidth
                      value={safeValues.receiverPostalCode || ''}
                      onChange={(e) => handleChange('receiverPostalCode', e.target.value)}
                      sx={{ ...customFieldStyle }}
                    />
                    <TextField
                      label={`${t('step1.city')} *`}
                      fullWidth
                      value={safeValues.receiverCity || ''}
                      onChange={(e) => handleChange('receiverCity', e.target.value)}
                      sx={{ ...customFieldStyle }}
                    />
                  </Box>
                  <FormControl fullWidth variant="outlined" sx={{ mb: 2, ...customFieldStyle }}>
                    <InputLabel id="receiver-country-label">
                      {t('step1.country')} *
                    </InputLabel>
                    <Select
                      labelId="receiver-country-label"
                      value={safeValues.receiverCountry || ''}
                      onChange={(e) => handleChange('receiverCountry', e.target.value)}
                      label={`${t('step1.country')} *`}
                    >
                      <MenuItem value="">
                        <em>-- Sélectionnez un pays --</em>
                      </MenuItem>
                      {countries.map((c) => (
                        <MenuItem key={c.id_country} value={c.symbol_fr}>
                          {c.symbol_fr}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Numéro de téléphone *"
                    fullWidth
                    value={safeValues.receiverPhone || ''}
                    onChange={(e) => handleChange('receiverPhone', e.target.value)}
                    sx={{ mb: 2, ...customFieldStyle }}
                  />
                </>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <div className="collapsible-header">
              <span className="section-title">3/8 ORIGINE</span>
            </div>
            <div className="collapsible-content">
              <Box sx={{ mt: 2 }}>
                <FormControl fullWidth variant="outlined" sx={{ mb: 2, ...customFieldStyle }}>
                  <InputLabel id="goods-origin-label">
                    Pays d'origine de la marchandise *
                  </InputLabel>
                  <Select
                    labelId="goods-origin-label"
                    value={safeValues.goodsOrigin || ''}
                    onChange={(e) => handleChange('goodsOrigin', e.target.value)}
                    label="Pays d'origine de la marchandise *"
                  >
                    <MenuItem value="">
                      <em>-- Sélectionnez un pays --</em>
                    </MenuItem>
                    {countries.map((c) => (
                      <MenuItem key={c.id_country} value={c.symbol_fr}>
                        {c.symbol_fr}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth variant="outlined" sx={{ mt: 2, ...customFieldStyle }}>
                  <InputLabel id="goods-destination-label">
                    Pays de destination de la marchandise *
                  </InputLabel>
                  <Select
                    labelId="goods-destination-label"
                    value={safeValues.goodsDestination || ''}
                    onChange={(e) => handleChange('goodsDestination', e.target.value)}
                    label="Pays de destination de la marchandise *"
                  >
                    <MenuItem value="">
                      <em>-- Sélectionnez un pays --</em>
                    </MenuItem>
                    {countries.map((c) => (
                      <MenuItem key={c.id_country} value={c.symbol_fr}>
                        {c.symbol_fr}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <div className="collapsible-header">
              <span className="section-title">4/8 MODES DE TRANSPORT</span>
            </div>
            <div className="collapsible-content">
              <Box sx={{ mt: 2, display: 'flex', gap: 2, mb: 2 }}>
                <FormControl fullWidth variant="outlined" sx={{ ...customFieldStyle }}>
                  <InputLabel id="loading-port-label">
                    Port de chargement *
                  </InputLabel>
                  <Select
                    labelId="loading-port-label"
                    value={safeValues.loadingPort || ''}
                    onChange={(e) => handleChange('loadingPort', e.target.value)}
                    label="Port de chargement *"
                  >
                    <MenuItem value="">
                      <em>-- Sélectionnez un pays --</em>
                    </MenuItem>
                    {countries.map((c) => (
                      <MenuItem key={c.id_country} value={c.symbol_fr}>
                        {c.symbol_fr}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth variant="outlined" sx={{ ...customFieldStyle }}>
                  <InputLabel id="discharging-port-label">
                    Port de déchargement *
                  </InputLabel>
                  <Select
                    labelId="discharging-port-label"
                    value={safeValues.dischargingPort || ''}
                    onChange={(e) => handleChange('dischargingPort', e.target.value)}
                    label="Port de déchargement *"
                  >
                    <MenuItem value="">
                      <em>-- Sélectionnez un pays --</em>
                    </MenuItem>
                    {countries.map((c) => (
                      <MenuItem key={c.id_country} value={c.symbol_fr}>
                        {c.symbol_fr}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ mb: 2 }}>
                <InputLabel sx={{ mb: 1 }}>Modes de transport</InputLabel>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {transportModes.map((mode) => (
                    <FormControlLabel
                      key={mode.id_transport_mode}
                      control={
                        <Radio
                          sx={{ color: '#DDAF26', '&.Mui-checked': { color: '#DDAF26' } }}
                          checked={!!safeValues.transportModes[mode.symbol_eng.toLowerCase()]}
                          onChange={(e) =>
                            handleChange('transportModes', {
                              ...safeValues.transportModes,
                              [mode.symbol_eng.toLowerCase()]: e.target.checked,
                            })
                          }
                        />
                      }
                      label={mode.symbol_fr}
                    />
                  ))}
                </Box>
              </Box>
              <TextField
                label="Remarques sur le transport"
                fullWidth
                multiline
                value={safeValues.transportRemarks || ''}
                onChange={(e) => handleChange('transportRemarks', e.target.value)}
                sx={{ ...customFieldStyle }}
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <div className="collapsible-header">
              <span className="section-title">5/8 MARCHANDISES</span>
            </div>
            <div className="collapsible-content">
              <Button
                variant="contained"
                onClick={createEmptyMerchLine}
                sx={{ mt: 2, mb: 2, ...customButtonStyle }}
              >
                Ajouter la marchandise
              </Button>
              {safeValues.merchandises.map((m, index) => {
                const isEditable = merchEditStates[index] || false;
                return (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 2,
                      alignItems: 'center',
                      mb: 2,
                      p: 2,
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                    }}
                  >
                    <TextField
                      label="Référence / HSCODE"
                      variant="outlined"
                      fullWidth
                      value={m.boxReference}
                      onChange={(e) =>
                        handleMerchChange(index, 'boxReference', e.target.value)
                      }
                      disabled={!isEditable}
                      sx={{ ...customFieldStyle }}
                    />
                    <TextField
                      label="Nature"
                      variant="outlined"
                      fullWidth
                      value={m.designation}
                      onChange={(e) =>
                        handleMerchChange(index, 'designation', e.target.value)
                      }
                      disabled={!isEditable}
                      sx={{ ...customFieldStyle }}
                    />
                    <FormControl variant="outlined" sx={{ width: '150px', ...customFieldStyle }}>
                      <InputLabel htmlFor={`merch-qty-${index}`}>
                        Quantité
                      </InputLabel>
                      <OutlinedInput
                        id={`merch-qty-${index}`}
                        type="number"
                        value={m.quantity === '' ? '' : m.quantity}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleMerchChange(
                            index,
                            'quantity',
                            val === '' ? '' : parseFloat(val)
                          );
                        }}
                        label="Quantité"
                        disabled={!isEditable}
                        endAdornment={
                          <InputAdornment position="end">
                            {m.unit}
                          </InputAdornment>
                        }
                      />
                    </FormControl>
                    <FormControl variant="outlined" sx={{ width: '150px', ...customFieldStyle }}>
                      <InputLabel id={`merch-unit-label-${index}`}>
                        Unité
                      </InputLabel>
                      <Select
                        labelId={`merch-unit-label-${index}`}
                        id={`merch-unit-${index}`}
                        value={m.unit}
                        label="Unité"
                        onChange={(e) =>
                          handleMerchChange(index, 'unit', e.target.value)
                        }
                        disabled={!isEditable}
                      >
                        {unitWeights.map((u) => (
                          <MenuItem key={u.id_unit_weight} value={u.symbol_fr}>
                            {u.symbol_fr}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      label="Référence doc. justificatif"
                      variant="outlined"
                      fullWidth
                      value={m.reference || ''}
                      onChange={(e) =>
                        handleMerchChange(index, 'reference', e.target.value)
                      }
                      disabled={!isEditable}
                      sx={{ ...customFieldStyle }}
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      {isEditable ? (
                        <IconButton
                          color="success"
                          onClick={() => validateLine(index)}
                          sx={{ mb: 1 }}
                        >
                          <FontAwesomeIcon icon={faCheck} />
                        </IconButton>
                      ) : (
                        <IconButton
                          color="primary"
                          onClick={() => toggleLineEdit(index)}
                          sx={{ mb: 1 }}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </IconButton>
                      )}
                      <IconButton
                        color="error"
                        onClick={() => removeMerchandise(index)}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </IconButton>
                    </Box>
                  </Box>
                );
              })}
            </div>
          </div>
        );
      case 5:
        return (
          <div>
            <div className="collapsible-header">
              <span className="section-title">6/8 NOMBRE DE COPIES</span>
            </div>
            <div className="collapsible-content">
              <Box sx={{ mt: 2 }}>
                <TextField
                  label="Combien de copies certifiées ?"
                  type="number"
                  fullWidth
                  value={safeValues.copies === '' ? '' : safeValues.copies}
                  onChange={(e) => {
                    if (e.target.value === '') {
                      handleChange('copies', '');
                    } else {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) {
                        handleChange('copies', val);
                      }
                    }
                  }}
                  InputProps={{ inputProps: { min: 1 } }}
                  sx={{ ...customFieldStyle }}
                />
              </Box>
            </div>
          </div>
        );
      case 6:
        return (
          <div>
            <div className="collapsible-header">
              <span className="section-title">7/8 ENGAGEMENT</span>
            </div>
            <div className="collapsible-content">
              <Box sx={{ mt: 3, mb: 2 }}>
                <Typography variant="body2" align="justify" gutterBottom>
                  <strong>Conditions Générales d'Utilisation – Création de Certificat d'Origine</strong>
                </Typography>
                <Typography variant="body2" align="justify" gutterBottom>
                  En utilisant notre site pour créer un certificat d'origine, vous reconnaissez avoir pris connaissance et accepter sans réserve les présentes Conditions Générales d'Utilisation (CGU). Ces CGU régissent votre utilisation de notre formulaire en ligne et la création du certificat d'origine.
                </Typography>
                <Typography variant="body2" align="justify" gutterBottom>
                  <strong>1. Objet</strong>
                  <br />
                  Les présentes conditions ont pour objet de définir les droits et obligations de l’utilisateur qui souhaite obtenir un certificat d'origine en remplissant l’intégralité du formulaire mis à disposition sur notre site. En soumettant vos informations, vous engagez votre responsabilité quant à leur exactitude et leur véracité.
                </Typography>
                <Typography variant="body2" align="justify" gutterBottom>
                  <strong>2. Acceptation des CGU</strong>
                  <br />
                  En remplissant le formulaire et en cliquant sur le bouton de validation, vous déclarez accepter pleinement et sans réserve l’intégralité des présentes CGU. Si vous n’acceptez pas ces conditions, vous ne devez pas utiliser notre service de création de certificat d'origine.
                </Typography>
                <Typography variant="body2" align="justify" gutterBottom>
                  <strong>3. Engagements et Obligations de l’Utilisateur</strong>
                  <br />
                  Exactitude des Informations : Vous garantissez que toutes les informations renseignées dans le formulaire sont complètes, exactes et à jour. Toute fausse déclaration ou omission volontaire pouvant entraîner des erreurs dans le certificat d'origine relève de votre seule responsabilité.
                  <br />
                  Authenticité : Vous vous engagez à fournir des données authentiques et vérifiables, notamment concernant l'origine, la destination, les caractéristiques des marchandises, ainsi que toute autre information requise pour l’établissement du certificat.
                  <br />
                  Mise à jour des Données : Vous vous engagez à actualiser vos informations en cas de changement, afin de garantir la conformité et la validité du certificat d'origine établi.
                  <br />
                  Respect de la Procédure : Vous acceptez de suivre la procédure de validation proposée par notre plateforme, notamment en validant chacune des sections du formulaire et en confirmant la véracité des informations avant la soumission finale.
                </Typography>
                <Typography variant="body2" align="justify" gutterBottom>
                  <strong>4. Responsabilité et Limitation</strong>
                  <br />
                  Responsabilité de l’Utilisateur : En cas d’erreur, d’omission ou de fourniture d’informations inexactes, notre site ne pourra être tenu responsable des conséquences pouvant en découler, tant sur le plan légal qu’administratif.
                  <br />
                  Exclusion de Garantie : Notre plateforme est fournie « en l'état ». Bien que nous nous efforcions de garantir la qualité et la fiabilité de notre service, nous ne saurions être tenus responsables d’éventuels dysfonctionnements, retards ou interruptions pouvant affecter la création du certificat d'origine.
                  <br />
                  Force Majeure : Notre responsabilité ne saurait être engagée en cas de force majeure, notamment en cas de perturbations indépendantes de notre volonté affectant le fonctionnement de notre système ou l’exactitude des données.
                </Typography>
                <Typography variant="body2" align="justify" gutterBottom>
                  <strong>5. Confidentialité et Protection des Données</strong>
                  <br />
                  Collecte et Utilisation : Les informations que vous renseignez dans le formulaire sont collectées dans le seul but de générer un certificat d'origine et d’assurer la bonne exécution de la procédure administrative afférente.
                  <br />
                  Sécurité : Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données personnelles contre tout accès non autorisé ou toute divulgation abusive.
                  <br />
                  Accès et Rectification : Vous disposez d’un droit d’accès, de rectification et de suppression de vos données. Pour exercer ce droit, veuillez consulter notre politique de confidentialité ou contacter notre service dédié.
                </Typography>
                <Typography variant="body2" align="justify" gutterBottom>
                  <strong>6. Propriété Intellectuelle</strong>
                  <br />
                  Tous les éléments (textes, images, logos, etc.) présents sur notre site restent la propriété exclusive de notre entreprise ou de ses partenaires. Toute reproduction, modification ou distribution, même partielle, est strictement interdite sans autorisation préalable.
                </Typography>
                <Typography variant="body2" align="justify" gutterBottom>
                  <strong>7. Modification des Conditions</strong>
                  <br />
                  Nous nous réservons le droit de modifier les présentes CGU à tout moment. Les modifications seront applicables dès leur mise en ligne et vous seront communiquées via notre site. Il vous appartient de consulter régulièrement ces conditions afin de prendre connaissance de toute mise à jour.
                </Typography>
                <Typography variant="body2" align="justify" gutterBottom>
                  <strong>8. Droit Applicable et Juridiction Compétente</strong>
                  <br />
                  Les présentes CGU sont régies par le droit en vigueur dans le pays de notre siège social. En cas de litige relatif à l'interprétation ou à l'exécution des présentes conditions, les tribunaux compétents seront ceux du ressort de notre siège social.
                </Typography>
                <Typography variant="body2" align="justify" gutterBottom>
                  <strong>9. Acceptation Finale</strong>
                  <br />
                  En validant le formulaire de création du certificat d'origine, vous reconnaissez avoir lu, compris et accepté l'ensemble des présentes Conditions Générales d'Utilisation. Vous vous engagez à respecter toutes les obligations qui y sont stipulées et assumez l'entière responsabilité de l'exactitude des informations fournies.
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!safeValues.isCommitted}
                    onChange={(e) => handleChange('isCommitted', e.target.checked)}
                    sx={{ color: '#DDAF26', '&.Mui-checked': { color: '#DDAF26' } }}
                    inputProps={{ 'aria-label': 'Engagement checkbox' }}
                  />
                }
                label={
                  <Typography variant="body1" align="justify">
                    Je certifie m'engager dans les conditions décrites ci-dessus
                  </Typography>
                }
              />
            </div>
          </div>
        );
      case 7:
        return (
          <div>
            <div className="collapsible-header">
              <span className="section-title">8/8 REMARQUES</span>
            </div>
            <div className="collapsible-content">
              <TextField
                label="Ajouter une remarque"
                fullWidth
                multiline
                value={safeValues.remarks || ''}
                onChange={(e) => handleChange('remarks', e.target.value)}
                sx={{ ...customFieldStyle }}
              />
              <Box sx={{ mt: 1 }}>
                Caractère(s) restant(s) : {300 - (safeValues.remarks?.length ?? 0)}
              </Box>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="step-form">
      <Slide
        direction={slideDirection}
        in={true}
        mountOnEnter
        unmountOnExit
        key={currentSection}
        timeout={300}
      >
        <div className="step-content">{renderSection()}</div>
      </Slide>
      {/* Affichage du message d'erreur spécifique via MUI Alert */}
      {errorMessage && (
        <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
          {errorMessage}
        </Alert>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button variant="outlined" onClick={onBack}>
          Retour
        </Button>
        {currentSection < totalSections - 1 ? (
          <Button variant="contained" onClick={nextSection} sx={customButtonStyle}>
            Suivant
          </Button>
        ) : (
          <Button variant="contained" type="submit" sx={customButtonStyle}>
            Terminer
          </Button>
        )}
      </Box>
    </form>
  );
};

export default Step2;
