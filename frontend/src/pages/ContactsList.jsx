import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import './ContactsList.css';
import { useSelector } from 'react-redux';
import { deleteCustUser, getCustUsersByAccount } from '../services/apiServices';

const ContactsList = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  // Assuming the user object contains a property id_cust_account
  const custAccountId = user ? user.id_cust_account : null;
  const isMainContact = user?.role_user === 1;


  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const result = await getCustUsersByAccount(
          custAccountId,
          null,            // statutflag (optional)
          'true',          // isactiveCA: as string ('true' to filter active accounts)
          'true',          // isactiveCU: as string ('true' to filter active users)
          null           // ismain_user: as string ('true' to filter main users; or use 'false'/null)
        );
        // Assuming the response format is { message: '...', data: [...] }
        setContacts(result.data || []);
      } catch (err) {
        console.error('Error fetching contacts:', err);
        setError('Une erreur est survenue lors de la récupération des contacts.');
      } finally {
        setLoading(false);
      }
    };

    if (custAccountId) {
      fetchContacts();
    } else {
      setError('Aucun identifiant de compte client trouvé.');
      setLoading(false);
    }
  }, [custAccountId]);


  

  const handleEdit = (contactId) => {
    if (isMainContact) {
      navigate(`/registercontact/${contactId}`);
    } else {
      alert("Seul un contact principal peut modifier un contact.");
    }
  };

  const handleDelete = async (contactId) => {

    if (!isMainContact) {
      alert("Seul un contact principal peut supprimer un contact.");
      return;
    }

    if (window.confirm('Êtes-vous sûr de vouloir désactiver ce contact ?')) {
      try {
        await deleteCustUser(contactId);
        // Remove the deactivated contact from the UI
        setContacts((prevContacts) =>
          prevContacts.filter((contact) => contact.id_cust_user !== contactId)
        );
        alert('Contact désactivé avec succès.');
      } catch (err) {
        alert('Erreur lors de la désactivation du contact.');
        console.error(err);
      }
    }
  };

  const handleAddNew = () => {
    if (isMainContact) {
      navigate('/registercontact');
    } else {
      alert("Seul un contact principal peut ajouter un nouveau contact.");
    }
  };

  return (
    <div className="contacts-page-container">
      <div className="contacts-header">
        <h1>LISTE DES CONTACTS</h1>
        <button className="add-contact-button" onClick={handleAddNew}>
          <FontAwesomeIcon icon={faPlus} className="icon-left" />
          Ajouter un nouveau contact
        </button>
      </div>
      <div className="dashboard-table-container">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Fonction</th>
              <th>Email</th>
              <th>Tél</th>
              <th>Portable</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id_cust_user}>
                <td>{contact.full_name}</td>
                <td>{contact.position}</td>
                <td>
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </td>
                <td>{contact.phone_number}</td>
                <td>{contact.mobile_number}</td>
                <td>
                  <label>
                    <input
                      type="checkbox"
                      checked={contact.ismain_user}
                      disabled
                    />
                    &nbsp; Contact principal
                  </label>
                </td>
                <td>
                  <button
                    className="minimal-button action-button"
                    onClick={() => handleEdit(contact.id_cust_user)}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                    &nbsp; Modifier
                  </button>
                  <button
                    className="minimal-button action-button"
                    onClick={() => handleDelete(contact.id_cust_user)}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                    &nbsp; Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContactsList;
