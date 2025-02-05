import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import './Step5.css';

// On suppose que Step5 peut importer addRecipient, fetchRecipients
import { addRecipient, fetchRecipients, renameOrder } from '../../../../services/apiServices';
import { useSelector } from 'react-redux';

const Step5 = ({ prevStep, values, handleSubmit, isModal, openSecondModal, handleChange }) => {
  console.log('Step5 => recipients:', values.recipients);

  // Valeur fixe pour le Demandeur (Société)

  const user = useSelector((state) => state.auth.user);
  const idLogin = user?.id_login_user;
  const idCustAccount = user?.id_cust_account;
  const companyName = user?.companyname;


  // État local pour gérer l'édition du libellé de commande
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [orderLabel, setOrderLabel] = useState(values.orderLabel || '');

  // État local pour gérer temporairement les modes de transport
const [tempTransportModes, setTempTransportModes] = useState(values.transportModes || {});

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
  alert('Modes de transport enregistrés');
};


  console.log("Label", values.orderLabel)

  useEffect(() => {
    setOrderLabel(values.orderLabel || '');
  }, [values.orderLabel]);


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
  
  // -------------------- SECTION 2/7 : DESTINATAIRE --------------------
  const recipients = values.recipients || [];
  const [selectedRecipientId, setSelectedRecipientId] = useState(values.selectedRecipientId || '');
  const [showNewRecipientModal, setShowNewRecipientModal] = useState(false);

  // Champs pour le nouveau destinataire (identiques à Step2)
  const [newRecipientLocal, setNewRecipientLocal] = useState({
    receiverName: '',
    receiverAddress: '',
    receiverAddress2: '',
    receiverPostalCode: '',
    receiverCity: '',
    receiverCountry: '',
    receiverPhone: '',
  });

  const handleRecipientChange = (e) => {
    setSelectedRecipientId(e.target.value);
  };

  const selectedRecipient = recipients.find(
    (r) => String(r.id_recipient_account) === String(selectedRecipientId)
  );

  const handleNewRecipientChange = (field, value) => {
    setNewRecipientLocal((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveNewRecipient = async () => {
    try {
      const newRecipientData = {
        idRecipientAccount: null,
        idCustAccount: values.customerAccountId, // Même clé que Step2
        recipientName: newRecipientLocal.receiverName,
        address1: newRecipientLocal.receiverAddress,
        address2: newRecipientLocal.receiverAddress2,
        address3: newRecipientLocal.receiverPostalCode,
        idCity: 1,
        statutFlag: 1,
        activationDate: new Date().toISOString(),
        deactivationDate: new Date('9999-12-31').toISOString(),
        idLoginInsert: values?.id_login_user || 1,
        idLoginModify: null,
        trade_registration_num: newRecipientLocal.receiverPhone,
        city_symbol_fr_recipient: newRecipientLocal.receiverCity,
        country_symbol_fr_recipient: newRecipientLocal.receiverCountry,
      };

      const recipientResponse = await addRecipient(newRecipientData);
      console.log(recipientResponse);
      const newRecipientId = recipientResponse?.newRecipientId;
      console.log('New recipient ID =', newRecipientId);
      console.log('New recipient created successfully!');

      const updatedRecipientsResponse = await fetchRecipients({
        idListCA: values.customerAccountId,
      });
      console.log('Liste mise à jour des destinataires:', updatedRecipientsResponse.data);
      values.recipients = updatedRecipientsResponse.data;

      setSelectedRecipientId(String(newRecipientId));
      values.selectedRecipientId = newRecipientId;

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
  const countries = values.countries || [];

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

  // -------------------- RENDU DU COMPOSANT --------------------
  return (
    <div className="step5-form">
      <h3 className="step5-title">Récapitulatif</h3>

      {/* Titre "Désignation de la commande" */}
      <h4 className="step5-main-title">Désignation de la commande</h4>

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
          {selectedRecipient && (
            <div className="step5-field-value step5-destinaire-box">
              {[
                selectedRecipient.address_1,
                selectedRecipient.address_2,
                selectedRecipient.address_3,
              ]
                .filter(Boolean)
                .join(', ')}
            </div>
          )}
            <button
              type="button"
              style={{ marginTop: '10px' }}
              onClick={() => setShowNewRecipientModal(true)}
            >
              + Ajouter un destinataire
            </button>
        </div>

        {/* 3/7 Description de la marchandise */}
        <div className="step5-recap-section">
          <h5>3/7 Description de la marchandise</h5>
          {values.merchandises && values.merchandises.length > 0 ? (
            <div className="step5-table-responsive">
              <table className="step5-merchandise-table">
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
          <button
            type="button"
            className="step5-add-merch-button"
            style={{ marginTop: '10px' }}
            onClick={() => setShowNewMerchModal(true)}
          >
            + Ajouter une marchandise
          </button>
        </div>

        {/* 4/7 Origine et Destination des Marchandises */}
        <div className="step5-recap-section">
          <h5>4/7 Origine et Destination des Marchandises</h5>
          <div className="step5-country-selection">
            <div className="step5-form-group">
              <label>Pays d'origine :</label>
              <select value={values.goodsOrigin || ''} onChange={handleChangeCountryOrigin}>
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
              <select value={values.goodsDestination || ''} onChange={handleChangeCountryDestination}>
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
          <div className="step5-form-group transport-modes">
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
          {/* Bouton pour enregistrer les modifications */}
          <button
          type="button"
          onClick={handleTransportModesSave}
          style={{
            backgroundColor: '#28a745', // vert bootstrap par exemple
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


        {/* 6/7 Autres */}
        <div className="step5-recap-section">
          <h5>6/7 Autres</h5>
          <div className="step5-recap-item">
            <span className="step5-recap-label">Copies certifiées :</span>
            <span className="step5-recap-value">{values.copies || 'Non spécifié'}</span>
          </div>
          <div className="step5-recap-item">
            <span className="step5-recap-label">Remarques :</span>
            <span className="step5-recap-value">{values.remarks || 'Aucune remarque'}</span>
          </div>
        </div>
      </div>
      
      <h4 className="step5-main-title">Pièce justificatives & annexes</h4>
      {/* 7/7 Pièce Justificatives dans un rectangle gris avec titre en orange */}
      <div className="step5-designation-commande">
        <h5 className="step5-sub-title">7/7 Pièce Justificatives & annexes</h5>
        <div className="step5-pieces-justificatives-rectangle">
          {values.documents && values.documents.length > 0 ? (
            <div className="step5-table-responsive">
              <table className="step5-document-table">
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
                      <td>{doc.type === 'justificative' ? 'Justificative' : 'Annexe'}</td>
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
              <input
                type="text"
                value={newRecipientLocal.receiverCountry}
                onChange={(e) => handleNewRecipientChange('receiverCountry', e.target.value)}
              />
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
