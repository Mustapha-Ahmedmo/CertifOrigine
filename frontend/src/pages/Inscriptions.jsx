import React, { useEffect, useState } from 'react';
import { getCustAccountInfo, updateCustAccountStatus } from '../services/apiServices';
import { formatDate } from '../utils/dateUtils';
import './Inscriptions.css';

const Inscriptions = () => {
  const [custAccounts, setCustAccounts] = useState([]);
  const [removingAccounts, setRemovingAccounts] = useState([]);

  useEffect(() => {
    const fetchCustAccounts = async () => {
      try {
        const response = await getCustAccountInfo(null, 0, true);
        setCustAccounts(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCustAccounts();
  }, []);

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

  return (
    <div className="inscriptions-page-container">
      <h1>Inscriptions à valider</h1>
      <div className="dashboard-table-container">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Catégorie</th>
              <th>Client</th>
              <th>Licence ZF</th>
              <th>Autres</th>
              <th>Contact Principal</th>
              <th>Fonction</th>
              <th>E-mail</th>
              <th>Num. tel</th>
              <th>N° portable</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {custAccounts.map((registration) => {
              const isRemoving = removingAccounts.includes(registration.id_cust_account);
              return (
                <tr
                  key={registration.id_cust_account}
                  className={isRemoving ? 'fade-out' : ''}
                >
                  <td>{formatDate(registration.insertdate)}</td>
                  <td>{registration.legal_form}</td>
                  <td>{registration.cust_name}</td>
                  <td>
                    <button className="icon-button minimal-button">
                      Ouvrir
                    </button>
                  </td>
                  <td>ss</td>
                  <td>{registration?.main_contact?.full_name}</td>
                  <td>{registration?.main_contact?.position}</td>
                  <td>{registration?.main_contact?.email}</td>
                  <td>{registration?.main_contact?.phone_number}</td>
                  <td>{registration?.main_contact?.mobile_number}</td>
                  <td>
                    <button
                      className="submit-button minimal-button"
                      onClick={() => handleValidate(registration.id_cust_account)}
                    >
                      Valider
                    </button>
                    <button className="reject-button">Rejeter</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inscriptions;
