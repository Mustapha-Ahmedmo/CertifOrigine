import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import './ContactsList.css';

const ContactsList = () => {
  const navigate = useNavigate();

  const contacts = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '123-456-7890',
      mobile: '987-654-3210',
      company: 'Acme Corp',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '555-555-5555',
      mobile: '444-444-4444',
      company: 'Globex Inc',
    },
    // Ajoutez plus de contacts ici
  ];

  const handleEdit = (contactId) => {
    alert(`Action: Modifier le contact ID = ${contactId}`);
  };

  const handleDelete = (contactId) => {
    alert(`Action: Supprimer le contact ID = ${contactId}`);
  };

  const handleAddNew = () => {
    navigate('/registercontact');
  };

  return (
    <div className="contacts-page-container">
      <div className="contacts-header">
        <h1>LISTING DES CONTACTS</h1>
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
              <th>Email</th>
              <th>Téléphone</th>
              <th>Portable</th>
              <th>Entreprise</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id}>
                <td>{contact.name}</td>
                <td>
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </td>
                <td>{contact.phone}</td>
                <td>{contact.mobile}</td>
                <td>{contact.company}</td>
                <td>
                  <button
                    className="minimal-button action-button"
                    onClick={() => handleEdit(contact.id)}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                    &nbsp; Modifier
                  </button>
                  <button
                    className="minimal-button action-button"
                    onClick={() => handleDelete(contact.id)}
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
