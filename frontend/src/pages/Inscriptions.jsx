import React, { useEffect, useState } from 'react';
import {
  getCustAccountInfo,
  updateCustAccountStatus,
  rejectCustAccount,
} from '../services/apiServices';
import { formatDate } from '../utils/dateUtils';
import './Inscriptions.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

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

  useEffect(() => {
    const fetchCustAccounts = async () => {
      try {
        const response = await getCustAccountInfo(null, 1, true);
        setCustAccounts(response.data);
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
        setRemovingAccounts((prev) => prev.filter((accountId) => accountId !== id));
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
        setRemovingAccounts((prev) => prev.filter((accountId) => accountId !== rejectingAccountId));
      }, 300);

      setShowRejectModal(false);
      setRejectingAccountId(null);
      setRejectionReason('');
    } catch (err) {
      alert(`Erreur lors du rejet : ${err.message}`);
    }
  };

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

  return (
    <div className="inscriptions-page-container">
      <h1>INSCRIPTION A VALIDER ({custAccounts.length})</h1>
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
            {custAccounts.map((registration) => {
              const isRemoving = removingAccounts.includes(registration.id_cust_account);

              return (
                <tr key={registration.id_cust_account} className={isRemoving ? 'fade-out' : ''}>
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
                      registration.files.map((file) => (
                        <button
                          key={file.id_files_repo}
                          className="file-button minimal-button"
                          onClick={() => handleFileClick(file)}
                        >
                          {file.txt_description_fr || 'Type inconnu'}
                        </button>
                      ))
                    ) : (
                      <span>Aucun fichier</span>
                    )}
                  </td>
                  <td>
                    {/* Bouton "Ouvrir" qui lance la modal avec le détail du contact */}
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
                {/* Si tu as plusieurs contacts, boucle ici. 
                    Pour l’exemple, on n’affiche que main_contact. */}
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
