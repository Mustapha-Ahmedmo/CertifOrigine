import React, { useState } from 'react';
import './ContactUs.css';
import { sendContactForm } from '../services/apiServices';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    companyName: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
   
    try {
      // Transform formData to match backend requirements
      const transformedData = {
        name: `${formData.firstName} ${formData.lastName}`.trim(), // Combine first and last name
        email: formData.email,
        subject: formData.companyName || 'Nouveau message de contact', // Use company name as subject or default value
        message: formData.message,
      };
  
      // Validate required fields
      if (!transformedData.name || !transformedData.email || !transformedData.subject || !transformedData.message) {
        throw new Error('Tous les champs sont obligatoires : nom, email, sujet et message.');
      }
  
      // Send the transformed data to the backend
      const response = await sendContactForm(transformedData);
  
      if (response.message) {
        setSuccessMessage(response.message || 'Votre message a été envoyé avec succès.');
      }
    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors de l\'envoi du message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-us-container">
      {/* Section texte à gauche */}
      <div className="contact-us-text">
        <h1>Contactez-nous</h1>
        <p>
          Cette prestation s’adresse aux entreprises locales et de zones franches opérant
          légalement à Djibouti et impliquées dans des opérations d’import-export. <br /><br />
          Pour plus d’informations sur les conditions de délivrances ou de légalisation ainsi
          que les tarifs, prière de contacter :
        </p>

        {/* Bloc du responsable produit inséré directement ici */}
        <div className="responsable-section">
          <p><strong>Le responsable produit :</strong></p>
          <p><strong>Nom :</strong> Mme Fathia Hassan Ali</p>
          <p><strong>Téléphone :</strong> 21 35 10 70 poste 130</p>
          <p><strong>E-mail :</strong> <a href="mailto:siee@ccd.dj">siee@ccd.dj</a></p>
        </div>
      </div>

      {/* Formulaire à droite */}
      <div className="contact-us-form">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              type="text"
              placeholder="Prénom"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              placeholder="Nom"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
          <input
            type="email"
            placeholder="Adresse e-mail"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            placeholder="Nom de l'entreprise"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
          />
          <textarea
            placeholder="Message"
            name="message"
            rows="5"
            value={formData.message}
            onChange={handleChange}
            required
          ></textarea>
          <button type="submit" className="send-message-btn" disabled={loading}>
            {loading ? 'Envoi en cours...' : 'Envoyer'}
          </button>
          {successMessage && <p className="success-message">{successMessage}</p>}
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>

      {/* Nouveau bloc en bas à droite */}
      <div className="footer-info">
        <p>
          Chambre de Commerce de Djibouti . Place Djibouti .
          Tel : +253-21351070 . Email : <a href="mailto:ccd@ccd.dj">ccd@ccd.dj</a>
        </p>
      </div>
    </div>
  );
};

export default ContactUs;
