import React, { useEffect, useState } from 'react';
import { getCustAccountInfo } from '../services/apiServices';
import { formatDate } from '../utils/dateUtils';
import './Inscriptions.css'; // Même CSS
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';

const API_URL = import.meta.env.VITE_API_URL;

const ClientsValides = () => {
  const [custAccounts, setCustAccounts] = useState([]);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // État du champ de recherche
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchValidatedAccounts = async () => {
      try {
        // Récupère tous les comptes
        const response = await getCustAccountInfo(null, 2, true);
        const data = response.data || [];

        // Filtrer localement pour ne garder que les comptes validés
        const onlyValidated = data.filter((account) => account.statut_flag === 2);
        setCustAccounts(onlyValidated);
      } catch (err) {
        console.error(err);
      }
    };
    fetchValidatedAccounts();
  }, []);

  // Ouvre la modal de contacts
  const handleOpenContactsModal = (account) => {
    setSelectedAccount(account);
    setShowContactModal(true);
  };

  // Ferme la modal
  const handleCloseContactsModal = () => {
    setSelectedAccount(null);
    setShowContactModal(false);
  };

  // Ouvrir fichier
  const handleFileClick = (file) => {
    const fileUrl = `${API_URL}/files/inscriptions/${new Date().getFullYear()}/${file.file_guid}`;
    window.open(fileUrl, '_blank');
  };

  // Saisie de la recherche
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filtrage texte
  const filteredAccounts = custAccounts.filter((registration) => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;

    const dateString = formatDate(registration.insertdate);

    const fields = [
      registration.cust_name,
      registration.legal_form,
      registration.full_address,
      registration.co_symbol_fr,
      registration.sectorName?.symbol_fr,
      registration.nif,
      registration.rchNumber,
      registration.licenseNumber,
      dateString,
    ]
      .filter(Boolean)
      .map((val) => String(val).toLowerCase());

    return fields.some((field) => field.includes(search));
  });

  return (
    <div className="inscriptions-page-container">
      <h1>CLIENTS VALIDÉS ({custAccounts.length})</h1>

      {/* Barre de recherche textuelle */}
      <div className="search-container">
        <label htmlFor="searchInput" className="search-label">
          Rechercher :
        </label>
        <input
          id="searchInput"
          className="search-input"
          type="text"
          placeholder="Tapez un mot-clé ou un chiffre..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <div className="dashboard-table-container">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Client</th>
              <th>Secteur</th>
              <th>Adresse Complète</th>
              <th>Pays</th>
              <th>Implantation</th>
              <th>Fichier Justificatifs</th>
              <th>Contact Principal</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.map((registration) => (
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
                    <input type="checkbox" checked={registration.in_free_zone} readOnly />
                    <span style={{ marginLeft: '5px' }}>Zone franche</span>
                  </label>
                </td>
                <td>
                  {/* Affichage des fichiers */}
                  {registration.files && registration.files.length > 0 ? (
                    registration.files.map((file) => {
                      let fileDescription = file.txt_description_fr || 'Type inconnu';
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

                  {/* Affichage explicite du numéro */
                  registration.in_free_zone && registration.licenseNumber && (
                    <div style={{ marginTop: '5px', fontStyle: 'italic' }}>
                      Numéro de licence : <strong>{registration.licenseNumber}</strong>
                    </div>
                  )}
                  {!registration.in_free_zone && registration.nif && (
                    <div style={{ marginTop: '5px', fontStyle: 'italic' }}>
                      NIF : <strong>{registration.nif}</strong>
                    </div>
                  )}
                  {!registration.in_free_zone && registration.rchNumber && (
                    <div style={{ marginTop: '5px', fontStyle: 'italic' }}>
                      RCS : <strong>{registration.rchNumber}</strong>
                    </div>
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de contact */}
      {showContactModal && selectedAccount && (
        <div className="modal-overlay" onClick={handleCloseContactsModal}>
          <div className="contacts-modal" onClick={(e) => e.stopPropagation()}>
            <h2>LISTING DES CONTACTS DE LA SOCIÉTÉ "{selectedAccount.cust_name}"</h2>

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
