import React, { useEffect, useState } from 'react';
import {
  getCustAccountInfo
} from '../services/apiServices';
import { formatDate } from '../utils/dateUtils';
import './Inscriptions.css';  // Vous pouvez utiliser le même CSS que la page Inscriptions
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';

const API_URL = import.meta.env.VITE_API_URL;

const ClientsValides = () => {
  const [custAccounts, setCustAccounts] = useState([]);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // État pour la liste déroulante (filtre par nom de client)
  const [clientsList, setClientsList] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');

  useEffect(() => {
    const fetchValidatedAccounts = async () => {
      try {
        // Récupère tous les comptes via l'API
        const response = await getCustAccountInfo(null, 2, true);
        const data = response.data || [];

        // Filtre pour ne garder que les comptes validés
        const onlyValidated = data.filter((account) => account.statut_flag === 2);

        setCustAccounts(onlyValidated);

        // Construire la liste (unique) des noms de clients validés
        const uniqueClients = [...new Set(onlyValidated.map((item) => item.cust_name))];
        setClientsList(uniqueClients);
      } catch (err) {
        console.error(err);
      }
    };
    fetchValidatedAccounts();
  }, []);

  // Ouvrir la modal de contacts pour l'inscription cliquée
  const handleOpenContactsModal = (account) => {
    setSelectedAccount(account);
    setShowContactModal(true);
  };

  // Fermer la modal de contacts
  const handleCloseContactsModal = () => {
    setSelectedAccount(null);
    setShowContactModal(false);
  };

  // Filtrage par client
  const handleSelectClient = (e) => {
    setSelectedClient(e.target.value);
  };

  // Filtre local pour afficher uniquement les comptes validés DU client sélectionné
  const filteredAccounts = selectedClient
    ? custAccounts.filter((acc) => acc.cust_name === selectedClient)
    : custAccounts;

  // Ouverture du fichier justificatif dans un nouvel onglet
  const handleFileClick = (file) => {
    const fileUrl = `${API_URL}/files/inscriptions/${new Date().getFullYear()}/${file.file_guid}`;
    window.open(fileUrl, '_blank');
  };

  return (
    <div className="inscriptions-page-container">
      <h1>CLIENTS VALIDÉS ({custAccounts.length})</h1>

      {/* Conteneur liste déroulante pour filtrer par client */}
      <div className="client-filter-container">
        <label htmlFor="clientSelect">Filtrer par client :</label>
        <select
          id="clientSelect"
          className="client-filter-select"
          value={selectedClient}
          onChange={handleSelectClient}
        >
          <option value="">-- Tous les clients validés --</option>
          {clientsList.map((client) => (
            <option key={client} value={client}>
              {client}
            </option>
          ))}
        </select>
      </div>

      <div className="dashboard-table-container">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Client (Catégorie + Nom)</th>
              <th>Secteur</th>
              <th>Adresse Complète</th>
              <th>Pays</th>
              <th>Implantation</th>
              <th>Fichier Justificatifs</th>
              <th>Contact Principal</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.map((registration) => {
              return (
                <tr key={registration.id_cust_account}>
                  <td>{formatDate(registration.insertdate)}</td>
                  <td>
                    {registration.legal_form} {registration.cust_name}
                  </td>
                  <td>{registration.sectorName?.symbol_fr || 'N/A'}</td>
                  <td>{registration.full_address}</td>
                  <td>{registration.co_symbol_fr}</td>
                  <td>
                    <label>
                      <input
                        type="checkbox"
                        checked={registration.in_free_zone}
                        readOnly
                      />
                      <span style={{ marginLeft: '5px' }}>Zone franche</span>
                    </label>
                  </td>
                  <td>
                    {registration.files && registration.files.length > 0 ? (
                      registration.files.map((file) => {
                        let fileDescription = file.txt_description_fr || 'Type inconnu';
                        // Ajouter la valeur NIF / RCS / licence entre parenthèses si disponible
                        if (fileDescription === 'NIF' && registration.nif) {
                          fileDescription += ` (${registration.nif})`;
                        } else if (
                          fileDescription === 'Immatriculation RCS' &&
                          registration.rchNumber
                        ) {
                          fileDescription += ` (${registration.rchNumber})`;
                        } else if (
                          fileDescription === 'Numéro de licence' &&
                          registration.licenseNumber
                        ) {
                          fileDescription += ` (${registration.licenseNumber})`;
                        }

                        return (
                          <button
                            key={file.id_files_repo}
                            className="file-button minimal-button"
                            onClick={() => handleFileClick(file)}
                          >
                            {fileDescription}
                          </button>
                        );
                      })
                    ) : (
                      <span>Aucun fichier</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="minimal-button toggle-contact-button"
                      onClick={() => handleOpenContactsModal(registration)}
                    >
                      <FontAwesomeIcon icon={faEye} />
                      <span className="button-text"> Ouvrir</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal pour afficher la/les fiche(s) de contact */}
      {showContactModal && selectedAccount && (
        <div className="modal-overlay" onClick={handleCloseContactsModal}>
          <div className="contacts-modal" onClick={(e) => e.stopPropagation()}>
            <h2>
              LISTING DES CONTACTS DE LA SOCIÉTÉ "{selectedAccount.cust_name}"
            </h2>

            <table className="contacts-modal-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Fonction</th>
                  <th>Email</th>
                  <th>Tél</th>
                  <th>Portable</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {selectedAccount.main_contact && (
                  <tr>
                    <td>{selectedAccount.main_contact.full_name}</td>
                    <td>{selectedAccount.main_contact.position || 'N/A'}</td>
                    <td>{selectedAccount.main_contact.email || 'N/A'}</td>
                    <td>{selectedAccount.main_contact.phone_number || 'N/A'}</td>
                    <td>{selectedAccount.main_contact.mobile_number || 'N/A'}</td>
                    <td>
                      <input type="checkbox" checked readOnly />
                      <span style={{ marginLeft: '5px' }}>Contact principal</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div style={{ textAlign: 'right', marginTop: '20px' }}>
              <button className="cancel-button" onClick={handleCloseContactsModal}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsValides;
