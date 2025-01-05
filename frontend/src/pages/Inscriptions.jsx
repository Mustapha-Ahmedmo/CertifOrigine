import React, { useEffect, useState } from 'react';
import {
  getCustAccountInfo,
  updateCustAccountStatus,
  rejectCustAccount,
} from '../services/apiServices';
import { formatDate } from '../utils/dateUtils';
import './Inscriptions.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';

const API_URL = import.meta.env.VITE_API_URL;

const Inscriptions = () => {
  const [custAccounts, setCustAccounts] = useState([]);
  const [removingAccounts, setRemovingAccounts] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingAccountId, setRejectingAccountId] = useState(null);

  // État pour la modal de contacts
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // État du champ de recherche
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCustAccounts = async () => {
      try {
        const response = await getCustAccountInfo(null, 1, true);
        const data = response.data || [];
        setCustAccounts(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCustAccounts();
  }, []);

  const handleFileClick = (file) => {
    const fileUrl = `${API_URL}/files/inscriptions/${new Date().getFullYear()}/${file.file_guid}`;
    window.open(fileUrl, '_blank');
  };

  const handleValidate = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir valider cette inscription ?')) {
      return;
    }
    try {
      await updateCustAccountStatus(id);
      alert('Le statut du compte client a été mis à jour avec succès.');
      setRemovingAccounts((prev) => [...prev, id]);
      setTimeout(() => {
        setCustAccounts((prevAccounts) =>
          prevAccounts.filter((account) => account.id_cust_account !== id)
        );
        setRemovingAccounts((prev) =>
          prev.filter((accountId) => accountId !== id)
        );
      }, 300);
    } catch (err) {
      alert(`Erreur lors de la mise à jour du statut : ${err.message}`);
    }
  };

  const handleReject = (id) => {
    setRejectingAccountId(id);
    setShowRejectModal(true);
  };

  const submitRejection = async () => {
    if (!rejectionReason.trim()) {
      alert('Veuillez entrer une raison de rejet.');
      return;
    }

    try {
      const idlogin = 1; // Replace with actual operator ID from AuthContext
      await rejectCustAccount(rejectingAccountId, rejectionReason, idlogin);

      alert('Le compte client a été rejeté avec succès.');
      setRemovingAccounts((prev) => [...prev, rejectingAccountId]);
      setTimeout(() => {
        setCustAccounts((prevAccounts) =>
          prevAccounts.filter((account) => account.id_cust_account !== rejectingAccountId)
        );
        setRemovingAccounts((prev) =>
          prev.filter((accountId) => accountId !== rejectingAccountId)
        );
      }, 300);

      setShowRejectModal(false);
      setRejectingAccountId(null);
      setRejectionReason('');
    } catch (err) {
      alert(`Erreur lors du rejet : ${err.message}`);
    }
  };

  // Gère la recherche textuelle
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filtrage : recherche sur plusieurs champs
  const filteredAccounts = custAccounts.filter((registration) => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;

    // Par exemple, on récupère la date formatée
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

  // Modal : ouvre la fiche de contacts
  const handleOpenContactsModal = (account) => {
    setSelectedAccount(account);
    setShowContactModal(true);
  };

  // Fermer la modal de contacts
  const handleCloseContactsModal = () => {
    setSelectedAccount(null);
    setShowContactModal(false);
  };

  return (
    <div className="inscriptions-page-container">
      <h1>INSCRIPTION A VALIDER ({custAccounts.length})</h1>

      {/* Barre de recherche textuelle à gauche */}
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
              <th>Client (Catégorie + Nom)</th>
              <th>Secteur</th>
              <th>Adresse Complète</th>
              <th>Pays</th>
              <th>Implantation</th>
              <th>Fichier Justificatifs</th>
              <th>Contact Principal</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.map((registration) => {
              const isRemoving = removingAccounts.includes(
                registration.id_cust_account
              );

              return (
                <tr
                  key={registration.id_cust_account}
                  className={isRemoving ? 'fade-out' : ''}
                >
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
                    {/* Affichage des fichiers existants */}
                    {registration.files && registration.files.length > 0 ? (
                      registration.files.map((file) => {
                        let fileDescription = file.txt_description_fr || 'Type inconnu';
                        // Ajouter la valeur NIF / RCS / licence entre parenthèses si dispo
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

                    {/* Affichage explicite du numéro en fonction de la situation */}
                    {registration.in_free_zone && registration.trade_registration_num && (
                      <div style={{ marginTop: '5px', fontStyle: 'italic' }}>
                        Numéro de licence : <strong>{registration.trade_registration_num}</strong>
                      </div>
                    )}

                    {/* Si on veut aussi gérer le cas "Autre" entreprise : NIF / RCS */}
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
                  <td>
                    <button
                      className="submit-button minimal-button"
                      onClick={() => handleValidate(registration.id_cust_account)}
                    >
                      Valider
                    </button>
                    <button
                      className="reject-button minimal-button"
                      onClick={() => handleReject(registration.id_cust_account)}
                    >
                      Rejeter
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

      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Raison du rejet</h2>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Entrez la raison du rejet..."
            ></textarea>
            <div className="modal-actions">
              <button onClick={submitRejection} className="reject-button">
                Confirmer le rejet
              </button>
              <button
                onClick={() => setShowRejectModal(false)}
                className="cancel-button"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inscriptions;
