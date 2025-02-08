import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import './Step5.css';

// On suppose que Step5 peut importer addRecipient, fetchRecipients
import { addRecipient, fetchCountries, fetchRecipients, getOrderFilesInfo, getOrdersForCustomer, renameOrder, updateCertificate } from '../../../../services/apiServices';
import { useSelector } from 'react-redux';

const Step5 = ({ prevStep, values, handleSubmit, isModal, openSecondModal, handleChange }) => {
  const safeValues = { ...values, recipients: values.recipients || [] };
  const [countries, setCountries] = useState([]);

  // Local state for file info (documents)
  const [documentsInfo, setDocumentsInfo] = useState([]);

  // Valeur fixe pour le Demandeur (Société)

  const user = useSelector((state) => state.auth.user);
  const idLogin = user?.id_login_user;
  const idCustAccount = user?.id_cust_account;
  const companyName = user?.companyname;
  const customerAccountId = user?.id_cust_account; // Customer Account ID



const API_URL = import.meta.env.VITE_API_URL;
    // Extract query params (certifId and orderId)
    const params = new URLSearchParams(location.search);
    const certifId = params.get('certifId');
    const orderId = params.get('orderId');

  // État local pour gérer l'édition du libellé de commande
  const [isEditingLabel, setIsEditingLabel] = useState(false);

  const [orderLabel, setOrderLabel] = useState(safeValues.orderLabel || '');
  const [localRecipients, setLocalRecipients] = useState(safeValues.recipients);
  const [selectedRecipientId, setSelectedRecipientId] = useState(safeValues.selectedRecipientId || '');
  // État local pour gérer temporairement les modes de transport
const [tempTransportModes, setTempTransportModes] = useState(values.transportModes || {});
const [merchandises, setMerchandises] = useState(values.merchandises || []);
useEffect(() => {
  setMerchandises(values.merchandises || []);
}, [values.merchandises]);
// Pour "Copies certifiées"
const [isEditingCopies, setIsEditingCopies] = useState(false);
const [copies, setCopies] = useState(values.copies || '');
useEffect(() => {
  setCopies(values.copies || '');
}, [values.copies]);

const saveCopies = () => {
  if (handleChange) {
    handleChange('copies', copies);
  }
  setIsEditingCopies(false);
};

// Pour "Remarques"
const [isEditingRemarks, setIsEditingRemarks] = useState(false);
const [remarks, setRemarks] = useState(values.remarks || '');
useEffect(() => {
  setRemarks(values.remarks || '');
}, [values.remarks]);

const saveRemarks = () => {
  if (handleChange) {
    handleChange('remarks', remarks);
  }
  setIsEditingRemarks(false);
};

const handleDeleteMerchandise = (indexToDelete) => {
  console.log("Suppression de la marchandise à l'index :", indexToDelete);
  const updatedMerchandises = merchandises.filter((_, i) => i !== indexToDelete);
  setMerchandises(updatedMerchandises);
  if (handleChange) {
    handleChange('merchandises', updatedMerchandises);
  }
  console.log("Nouvelle liste :", updatedMerchandises);
};

const handleFileClick = (file) => {
  // Construct the file URL
  const fileUrl = `${API_URL}/files/commandes/${new Date().getFullYear()}/${file.file_guid}`;
  // Open in a new browser tab
  window.open(fileUrl, '_blank');
};


// Synchroniser cet état local si values.transportModes change
useEffect(() => {
  setTempTransportModes(values.transportModes || {});
}, [values.transportModes]);

  // Fonction pour mettre à jour l'état local lors du clic sur une case
  const handleCheckboxChange = (modeKey, checked) => {
    setTempTransportModes((prev) => ({
      ...prev,
      [modeKey]: checked,
    }));
  };

  // Fonction pour enregistrer les modifications dans le state global (via handleChange)
  const handleTransportModesSave = () => {
    if (handleChange) {
      handleChange('transportModes', tempTransportModes);
    }
    alert('Contenu du Certificat enregistré');
  };


  console.log("Label", values.orderLabel)


  // Other local state for modals and form fields (new recipient, new merchandise, etc.)
  const [showNewRecipientModal, setShowNewRecipientModal] = useState(false);
  const [newRecipientLocal, setNewRecipientLocal] = useState({
    receiverName: '',
    receiverAddress: '',
    receiverAddress2: '',
    receiverPostalCode: '',
    receiverCity: '',
    receiverCountry: '',
    receiverPhone: '',
  });



  useEffect(() => {
    setOrderLabel(values.orderLabel || '');
  }, [values.orderLabel]);


  useEffect(() => {
    const loadCountries = async () => {
      try {
        const response = await fetchCountries();
        // Assuming the response is an object with a 'data' property or directly an array
        const countriesData = response.data || response;
        setCountries(countriesData);
      } catch (error) {
        console.error('Error fetching countries in Step5:', error);
      }
    };
    loadCountries();
  }, []);


  // Fetch recipients if not present locally and if we have a customerAccountId
  useEffect(() => {
    const loadRecipients = async () => {
      if ((!localRecipients || localRecipients.length === 0) && customerAccountId) {
        try {
          const response = await fetchRecipients({ idListCA: customerAccountId });
          console.log("Fetched recipients in Step5:", response.data);
          setLocalRecipients(response.data);
          // Also update the parent's state if needed:
          if (handleChange) {
            handleChange('recipients', response.data);
          }
        } catch (error) {
          console.error("Error fetching recipients in Step5:", error);
        }
      }
    };
    loadRecipients();
  }, [customerAccountId, localRecipients, handleChange]);

  // If no recipient is selected yet, choose the first one from localRecipients
  useEffect(() => {
    if ((!selectedRecipientId || selectedRecipientId === "") && localRecipients.length > 0) {
      const defaultId = localRecipients[0].id_recipient_account;
      setSelectedRecipientId(String(defaultId));
      if (handleChange) {
        handleChange('selectedRecipientId', defaultId);
      }
    }
  }, [selectedRecipientId, localRecipients, handleChange]);


  console.log(values)
  const saveOrderLabel = async () => {
    // We assume values.orderId is present and values.id_login_user holds the current user ID
    if (!values.orderId || !idLogin) {
      console.error('Missing orderId or id_login_user in values.');
      return;
    }

    try {
      const payload = {
        p_id_order: values.orderId,
        p_order_title: orderLabel,
        p_idlogin_modify: idLogin, // or pass the current user ID
      };
      const response = await renameOrder(payload);
      console.log('Rename order API response:', response);
      setIsEditingLabel(false);
      // Update parent's state with the new order label
      if (handleChange) {
        handleChange('orderLabel', orderLabel);
      }
    } catch (error) {
      console.error('Error renaming order:', error);
      // Optionally, you can show an error message here
    }
  };


  const handleSaveExporter = () => {
    if (handleChange) {
      handleChange('orderLabel', orderLabel);
    }
    alert('Les informations du demandeur/expéditeur ont été enregistrées.');
  };





  // Compute the currently selected recipient
  const selectedRecipient = values.recipients
    ? values.recipients.find(
      (r) => String(r.id_recipient_account) === String(selectedRecipientId)
    )
    : null;

  const handleRecipientChange = (e) => {
    const newSelected = e.target.value;
    setSelectedRecipientId(newSelected);
    // Optionally, update parent's state so that the selected recipient can be used elsewhere
    if (handleChange) {
      handleChange('selectedRecipientId', newSelected);
    }
  };

  // New: Handler for submitting the recipient change (update the order with the new recipient)
  const handleRecipientSubmit = async () => {
    if (!safeValues.orderId || !selectedRecipientId || !idLogin) {
      console.error('Missing orderId, selectedRecipientId, or id_login_user.');
      return;
    }
    try {

      const ordersResponse = await getOrdersForCustomer({
        idCustAccountList: idCustAccount,
        idLogin,
      });
      const orders = ordersResponse.data || [];

          // Filter to get the order that matches the current orderId
    const currentOrder = orders.find(order => order.id_order == orderId);
    if (!currentOrder) {
      console.error('Order not found.');
      return;
    }

        // Assume that the certificate data is stored in a property like certData in the order
    // (Adjust the property names based on your actual API response)
    const certData = currentOrder.certData || currentOrder;
    
    // Build the update payload using the certificate data from the current order
    const certUpdateData = {
      p_id_ord_certif_ori: certData.id_ord_certif_ori, // Use the certificate ID from the order
      p_id_recipient_account: selectedRecipientId,       // New recipient ID
      p_id_country_origin: certData.id_country_origin,
      p_id_country_destination: certData.id_country_destination,
      p_id_country_port_loading: certData.id_country_port_loading,
      p_id_country_port_discharge: certData.id_country_port_discharge,
      p_notes: certData.notes || '',
      p_copy_count: certData.copy_count || safeValues.copies,
      p_idlogin_modify: idLogin,
      p_transport_remains: safeValues.transportRemarks || '',
    };
    
    
      const response = await updateCertificate(certUpdateData);
      console.log('Certificate updated:', response);
      alert('Le destinataire et autres informations du certificat ont été mis à jour.');
      if (handleChange) {
        handleChange('selectedRecipientId', selectedRecipientId);
      }
    } catch (error) {
      console.error('Error updating order recipient:', error);
      alert("Erreur lors de la mise à jour du destinataire.");
    }
  };

  const handleNewRecipientChange = (field, value) => {
    setNewRecipientLocal((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveNewRecipient = async () => {
    try {
      const newRecipientData = {
        idRecipientAccount: null,
        idCustAccount: customerAccountId,
        recipientName: newRecipientLocal.receiverName,
        address1: newRecipientLocal.receiverAddress,
        address2: newRecipientLocal.receiverAddress2,
        address3: newRecipientLocal.receiverPostalCode,
        idCity: 1,
        statutFlag: 1,
        activationDate: new Date().toISOString(),
        deactivationDate: new Date('9999-12-31').toISOString(),
        idLoginInsert: idLogin || 1,
        idLoginModify: null,
        trade_registration_num: newRecipientLocal.receiverPhone,
        city_symbol_fr_recipient: newRecipientLocal.receiverCity,
        country_symbol_fr_recipient: newRecipientLocal.receiverCountry,
      };

      const recipientResponse = await addRecipient(newRecipientData);
      console.log('New recipient creation response:', recipientResponse);
      const newRecipientId = recipientResponse?.newRecipientId;
      console.log('New recipient ID =', newRecipientId);

      // Fetch updated recipients and update parent state
      const updatedRecipientsResponse = await fetchRecipients({ idListCA: customerAccountId });
      console.log('Updated recipients:', updatedRecipientsResponse.data);
      if (handleChange) {
        handleChange('recipients', updatedRecipientsResponse.data);
      }
      setSelectedRecipientId(String(newRecipientId));
      if (handleChange) {
        handleChange('selectedRecipientId', newRecipientId);
      }
      setLocalRecipients(updatedRecipientsResponse.data);

   
      setShowNewRecipientModal(false);
      setNewRecipientLocal({
        receiverName: '',
        receiverAddress: '',
        receiverAddress2: '',
        receiverPostalCode: '',
        receiverCity: '',
        receiverCountry: '',
        receiverPhone: '',
      });
    } catch (error) {
      console.error('Error creating new recipient:', error);
    }
  };

  // -------------------- SECTION 2/7 : DESTINATAIRE --------------------
  const recipients = values.recipients || [];


  // -------------------- SECTION 3/7 : DESCRIPTION DE LA MARCHANDISE --------------------
  const [showNewMerchModal, setShowNewMerchModal] = useState(false);
  const [newMerchLocal, setNewMerchLocal] = useState({
    designation: '',
    boxReference: '',
    quantity: '',
    unit: '',
  });

  const handleNewMerchChange = (field, value) => {
    setNewMerchLocal((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveNewMerch = () => {
    try {
      if (!values.merchandises) {
        values.merchandises = [];
      }
      values.merchandises.push({
        designation: newMerchLocal.designation,
        boxReference: newMerchLocal.boxReference,
        quantity: newMerchLocal.quantity,
        unit: newMerchLocal.unit,
      });
      setShowNewMerchModal(false);
      setNewMerchLocal({
        designation: '',
        boxReference: '',
        quantity: '',
        unit: '',
      });
    } catch (error) {
      console.error('Error adding merchandise:', error);
    }
  };

  // -------------------- SECTION 4/7 : ORIGINE ET DESTINATION DES MARCHANDISES --------------------
  const handleChangeCountryOrigin = (e) => {
    if (handleChange) {
      handleChange('goodsOrigin', e.target.value);
    }
  };

  const handleChangeCountryDestination = (e) => {
    if (handleChange) {
      handleChange('goodsDestination', e.target.value);
    }
  };

  // -------------------- SECTION 5/7 : TRANSPORT --------------------
  const handleTransportModeChange = (modeKey, checked) => {
    if (handleChange) {
      const updatedModes = { ...values.transportModes, [modeKey]: checked };
      handleChange('transportModes', updatedModes);
    }
  };

  // -------------------- SECTION 6/7 : AUTRES --------------------
  // Les valeurs (copies et remarques) sont déjà renseignées dans values (Step2)





  // =======================================================================
  // NEW: Retrieve file information for the current order using getOrderFilesInfo
  // =======================================================================
  useEffect(() => {
    const loadDocumentsInfo = async () => {
      try {
        // Prepare parameters for the function.
        // Here we pass the current orderId. You may add more parameters as needed.
        const queryParams = {
          p_id_order_list: orderId,
          p_isactive: true,
          p_id_custaccount: customerAccountId,
        };
        const result = await getOrderFilesInfo(queryParams);
        // Update our state with the retrieved documents info
        setDocumentsInfo(result);
      } catch (error) {
        console.error('Error retrieving documents info:', error);
      }
    };

    if (orderId) {
      loadDocumentsInfo();
    }
  }, [orderId]);


  // -------------------- RENDU DU COMPOSANT --------------------
  return (
    <div className="step5-form">
      <h3 className="step5-title">Récapitulatif</h3>

      {/* Titre "Désignation de la commande" */}
      <h4 className="step5-main-title">Désignation commande</h4>

      {/* 1/7 Demandeur / Expediteur */}
      <div className="step5-designation-commande">
        <h5 className="step5-sub-title">1/7 Demandeur / Expediteur</h5>
        <div className="step5-field-row">
          <span className="step5-field-label">Société :</span>
          <span className="step5-field-value step5-fixed-field">
            {isModal ? (
              <span
                className="step5-clickable"
                onClick={() =>
                  openSecondModal({
                    name: companyName,
                    address: '123 Rue Principale, Ville, Pays',
                    address2: 'Suite 456',
                    contact: 'M. Vladimir Outof\nManager',
                    activity: 'Construction',
                    statut: 'Actif',
                  })
                }
              >
                {companyName}
              </span>
            ) : (
              companyName
            )}
          </span>
        </div>
        <div className="step5-field-row">
          <span className="step5-field-label">Libellé de commande :</span>
          <span className="step5-field-value">
            {isEditingLabel ? (
              <div className="step5-editable-field">
                <input
                  type="text"
                  value={orderLabel}
                  onChange={(e) => setOrderLabel(e.target.value)}
                  className="step5-editable-input step5-white-input"
                />
                <div className="step5-save-container">
                  <button type="button" className="step5-save-button" onClick={saveOrderLabel}>
                    Enregistrer
                  </button>
                </div>
              </div>
            ) : (
              <div className="step5-editable-display">
                <span>{orderLabel || 'Aucun libellé spécifié'}</span>
                <FontAwesomeIcon
                  icon={faPencilAlt}
                  className="step5-pencil-icon"
                  onClick={() => setIsEditingLabel(true)}
                />
              </div>
            )}
          </span>
        </div>
      </div>

      {/* Titre et bouton "Modifier" pour Certificat d'origine */}
      <div className="step5-designation-header">
        <h4>Contenu du Certificat d'origine</h4>
      </div>

      {/* Section Contenu du Certificat d'origine */}
      <div className="step5-contenu-certificat">
        {/* 2/7 Destinataire */}
        {/* Recipient Section */}
        <div className="step5-recap-section">
          <h5>2/7 Destinataire</h5>
          <div className="step5-form-group">
            <select
              id="recipientSelect"
              className="step5-recipient-select"
              value={selectedRecipientId}
              onChange={handleRecipientChange}
            >
              <option value="">-- Sélectionnez un destinataire --</option>
              {localRecipients.map((recipient) => (
                <option key={recipient.id_recipient_account} value={recipient.id_recipient_account}>
                  {recipient.recipient_name}
                </option>
              ))}
            </select>
          </div>
          {/* Bouton placé dans un conteneur sans label pour être aligné à gauche */}
          <div style={{ marginTop: '10px' }}>
            <button
              type="button"
              className="step5-add-merch-button"
              onClick={() => setShowNewRecipientModal(true)}
            >
              + Ajouter un destinataire
            </button>
          </div>
        </div>

        {/* 3/7 Description de la marchandise */}
        <div className="step5-recap-section">
          <h5>3/7 Description de la marchandise</h5>
          {merchandises && merchandises.length > 0 ? (
            <div className="step5-table-responsive">
              <table className="step5-merchandise-table">
                <thead>
                  <tr>
                    <th>Désignation</th>
                    <th>Référence / HSCODE</th>
                    <th>Quantité</th>
                    <th>Unité</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {merchandises.map((item, index) => (
                    <tr key={index}>
                      <td>{item.designation || 'Non spécifié'}</td>
                      <td>{item.boxReference || 'Non spécifié'}</td>
                      <td>{item.quantity || 'Non spécifié'}</td>
                      <td>{item.unit || 'Non spécifié'}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleDeleteMerchandise(index)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            color: 'red',
                            fontSize: '16px'
                          }}
                          title="Supprimer cette marchandise"
                        >
                          ❌
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Aucune marchandise ajoutée.</p>
          )}

          <button
            type="button"
            className="step5-add-merch-button"
            style={{ marginTop: '10px' }}
            onClick={() => setShowNewMerchModal(true)}
          >
            + Ajouter une marchandise
          </button>
        </div>


        <div className="step5-recap-section">
          <h5>4/7 Origine et Destination des Marchandises</h5>
          <div className="step5-country-selection">
            <div className="step5-form-group">
              <label>Pays d'origine :</label>
              <select className="step5-dropdown" value={values.goodsOrigin || ''} onChange={handleChangeCountryOrigin}>
                <option value="">-- Sélectionnez un pays --</option>
                {countries.map((country) => (
                  <option key={country.id_country} value={country.symbol_fr}>
                    {country.symbol_fr}
                  </option>
                ))}
              </select>
            </div>

            <div className="step5-form-group">
              <label>Pays de destination :</label>
              <select className="step5-dropdown" value={values.goodsDestination || ''} onChange={handleChangeCountryDestination}>
                <option value="">-- Sélectionnez un pays --</option>
                {countries.map((country) => (
                  <option key={country.id_country} value={country.symbol_fr}>
                    {country.symbol_fr}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>




        {/* 5/7 Transport */}
        <div className="step5-recap-section">
          <h5>5/7 Transport</h5>

          <div className="step5-form-group">
            <label>Port de chargement :</label>
            <select
              className="step5-dropdown"
              value={values.loadingPort || ''}
              onChange={(e) => handleChange('loadingPort', e.target.value)}
            >
              <option value="">-- Sélectionnez un pays --</option>
              {countries.map((country) => (
                <option key={country.id_country} value={country.symbol_fr}>
                  {country.symbol_fr}
                </option>
              ))}
            </select>
          </div>

          <div className="step5-form-group">
            <label>Port de déchargement :</label>
            <select
              className="step5-dropdown"
              value={values.dischargingPort || ''}
              onChange={(e) => handleChange('dischargingPort', e.target.value)}
            >
              <option value="">-- Sélectionnez un pays --</option>
              {countries.map((country) => (
                <option key={country.id_country} value={country.symbol_fr}>
                  {country.symbol_fr}
                </option>
              ))}
            </select>
          </div>

          <div className="step5-form-group">
            <label>Modes de transport :</label>
            <div className="transport-options">
              {tempTransportModes && Object.keys(tempTransportModes).length > 0 ? (
                Object.keys(tempTransportModes).map((modeKey) => (
                  <label key={modeKey} style={{ marginRight: '10px' }}>
                    <input
                      type="checkbox"
                      checked={tempTransportModes[modeKey]}
                      onChange={(e) => handleCheckboxChange(modeKey, e.target.checked)}
                    />
                    {modeKey.charAt(0).toUpperCase() + modeKey.slice(1)}
                  </label>
                ))
              ) : (
                <p>Aucun mode de transport disponible.</p>
              )}
            </div>
          </div>

          {/* Ajout du champ "Remarques sur le transport" */}
          <div className="step5-form-group">
            <label>Remarques sur le transport :</label>
            <span className="step5-recap-value">
              {values.transportRemarks || "Aucune remarque"}
            </span>
          </div>

          <div className="step5-form-group">
            <button
              type="button"
              onClick={handleTransportModesSave}
              style={{
                backgroundColor: '#28a745',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Enregistrer
            </button>
          </div>
        </div>





       
        {/* 6/7 Autres */}

      <div className="step5-recap-section">
        <h5>6/7 Autres</h5>
        <div className="step5-recap-item">
          <span className="step5-recap-label">Copies certifiées :</span>
          {/* On ajoute ici la classe step5-fixed-field pour avoir l'encadré gris */}
          <span className="step5-recap-value step5-fixed-field">
            {isEditingCopies ? (
              <div className="step5-editable-field">
                <input
                  type="number"
                  value={copies}
                  onChange={(e) => setCopies(e.target.value)}
                  className="step5-editable-input step5-white-input"
                />
                <div className="step5-save-container">
                  <button type="button" className="step5-save-button" onClick={saveCopies}>
                    Enregistrer
                  </button>
                </div>
              </div>
            ) : (
              <div className="step5-editable-display">
                <span>{copies || 'Non spécifié'}</span>
                <FontAwesomeIcon
                  icon={faPencilAlt}
                  className="step5-pencil-icon"
                  onClick={() => setIsEditingCopies(true)}
                />
              </div>
            )}
          </span>
        </div>
        <div className="step5-recap-item">
          <span className="step5-recap-label">Remarques :</span>
          <span className="step5-recap-value step5-fixed-field">
            {isEditingRemarks ? (
              <div className="step5-editable-field">
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="step5-editable-input step5-white-input"
                />
                <div className="step5-save-container">
                  <button type="button" className="step5-save-button" onClick={saveRemarks}>
                    Enregistrer
                  </button>
                </div>
              </div>
            ) : (
              <div className="step5-editable-display">
                <span>{remarks || 'Aucune remarque'}</span>
                <FontAwesomeIcon
                  icon={faPencilAlt}
                  className="step5-pencil-icon"
                  onClick={() => setIsEditingRemarks(true)}
                />
              </div>
            )}
          </span>
        </div>
      </div>
      <div className="step5-form-group">
    <button
      type="button"
      onClick={handleTransportModesSave}
      style={{
        backgroundColor: '#28a745',
        color: '#fff',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Enregistrer
    </button>
  </div>


      </div>

      <h4 className="step5-main-title">Pièce justificatives & annexes</h4>
      {/* 7/7 Pièce Justificatives dans un rectangle gris avec titre en orange */}
      <div className="step5-designation-commande">
        <h5 className="step5-sub-title">7/7 Pièce Justificatives & annexes</h5>
        <div className="step5-pieces-justificatives-rectangle">
          {documentsInfo && documentsInfo.length > 0 ? (
            <div className="step5-table-responsive">
              <table className="step5-document-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Type</th>
                    <th>Fichier</th>
                  </tr>
                </thead>
                <tbody>
                  {documentsInfo.map((doc, index) => (
                    <tr key={index}>
                      <td>{doc.txt_description_fr}</td>
                      <td>{doc.type === 'justificative' ? 'Justificative' : 'Annexe'}</td>
                  {/* 3) Clickable link */}
                  <td>
                    {doc.file_guid ? (
                          <span
                          onClick={() => handleFileClick(doc)}
                          style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
                        >
                          {doc.file_origin_name || 'Télécharger le fichier'}
                        </span>
                    ) : (
                      "Aucun fichier"
                    )}
                  </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Aucune pièce justificative ajoutée.</p>
          )}
          <button type="button" className="step5-upload-button">
            Upload
          </button>
        </div>
      </div>

      {/* Actions */}
      {!isModal && (
        <div className="step5-submit-section">
          <button type="button" className="step5-next-button" onClick={handleSubmit}>
            Soumettre
          </button>
        </div>
      )}

      {/* Modal pour créer un nouveau destinataire */}
      {showNewRecipientModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>Créer un nouveau destinataire</h3>
            <div className="form-group">
              <label>Nom de l'entreprise *</label>
              <input
                type="text"
                value={newRecipientLocal.receiverName}
                onChange={(e) => handleNewRecipientChange('receiverName', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Adresse *</label>
              <input
                type="text"
                value={newRecipientLocal.receiverAddress}
                onChange={(e) => handleNewRecipientChange('receiverAddress', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Complément d'adresse</label>
              <input
                type="text"
                value={newRecipientLocal.receiverAddress2}
                onChange={(e) => handleNewRecipientChange('receiverAddress2', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Code postal *</label>
              <input
                type="text"
                value={newRecipientLocal.receiverPostalCode}
                onChange={(e) => handleNewRecipientChange('receiverPostalCode', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Ville *</label>
              <input
                type="text"
                value={newRecipientLocal.receiverCity}
                onChange={(e) => handleNewRecipientChange('receiverCity', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Pays *</label>
              <select
                value={newRecipientLocal.receiverCountry}
                onChange={(e) => handleNewRecipientChange('receiverCountry', e.target.value)}
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
              <label>Numéro de téléphone *</label>
              <input
                type="tel"
                value={newRecipientLocal.receiverPhone}
                onChange={(e) => handleNewRecipientChange('receiverPhone', e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '10px' }}>
              <button type="button" onClick={() => setShowNewRecipientModal(false)}>
                Annuler
              </button>
              <button type="button" onClick={handleSaveNewRecipient}>
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour créer une nouvelle marchandise */}
      {showNewMerchModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>Ajouter une nouvelle marchandise</h3>
            <div className="form-group">
              <label>Désignation</label>
              <input
                type="text"
                value={newMerchLocal.designation}
                onChange={(e) => handleNewMerchChange('designation', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Référence / HSCODE</label>
              <input
                type="text"
                value={newMerchLocal.boxReference}
                onChange={(e) => handleNewMerchChange('boxReference', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Quantité</label>
              <input
                type="number"
                value={newMerchLocal.quantity}
                onChange={(e) => handleNewMerchChange('quantity', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Unité</label>
              <input
                type="text"
                value={newMerchLocal.unit}
                onChange={(e) => handleNewMerchChange('unit', e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '10px' }}>
              <button type="button" onClick={() => setShowNewMerchModal(false)}>
                Annuler
              </button>
              <button type="button" onClick={handleSaveNewMerch}>
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step5;
