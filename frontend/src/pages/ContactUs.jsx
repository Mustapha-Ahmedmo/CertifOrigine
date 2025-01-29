import React from 'react';
import './ContactUs.css';

const ContactUs = () => {
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
      </div>

      {/* Formulaire à droite */}
      <div className="contact-us-form">
        <form>
          <div className="form-row">
            <input type="text" placeholder="First name" required />
            <input type="text" placeholder="Last name" required />
          </div>
          <input type="email" placeholder="Email address" required />
          <input type="text" placeholder="Company name" />
          <textarea placeholder="Message" rows="5" required></textarea>
          <button type="submit" className="send-message-btn">Send Message</button>
        </form>
      </div>

      {/* Section du responsable produit */}
      <div className="responsable-section">
        <p><strong>Le responsable produit :</strong></p>
        <p><strong>Nom :</strong> Mme Fathia Hassan Ali</p>
        <p><strong>Téléphone :</strong> 21 35 10 70 poste 130</p>
        <p><strong>E-mail :</strong> <a href="mailto:siee@ccd.dj">siee@ccd.dj</a></p>
      </div>
    </div>
  );
};

export default ContactUs;
