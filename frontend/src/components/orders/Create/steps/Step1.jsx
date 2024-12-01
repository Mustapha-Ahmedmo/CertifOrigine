import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Step1.css';

const Step1 = ({ nextStep, handleMerchandiseChange, handleChange, values }) => {
  const { t } = useTranslation();
  const [isNewExporter, setIsNewExporter] = useState(true); // Pour gérer exportateur
  const [isNewDestinataire, setIsNewDestinataire] = useState(true); // Pour gérer destinataire
  const [errorMessage, setErrorMessage] = useState('');
  const [saveRecipient, setSaveRecipient] = useState(false);
  const [selectedFakeCompany, setSelectedFakeCompany] = useState(''); // Nouvel état pour l'entreprise fictive

  // Données fictives pour les entreprises
  const fakeCompanies = {
    'Entreprise Factice A': {
      receiverName: 'Entreprise Factice A',
      receiverAddress: '123 Rue Fictive',
      receiverAddress2: 'Bâtiment A',
      receiverPostalCode: '75001',
      receiverCity: 'Paris',
      receiverCountry: 'France',
      receiverPhone: '0102030405',
    },
    'Entreprise Factice B': {
      receiverName: 'Entreprise Factice B',
      receiverAddress: '456 Avenue Imaginaire',
      receiverAddress2: 'Suite 200',
      receiverPostalCode: '1000',
      receiverCity: 'Bruxelles',
      receiverCountry: 'Belgique',
      receiverPhone: '0203040506',
    },
    'Entreprise Factice C': {
      receiverName: 'Entreprise Factice C',
      receiverAddress: '789 Boulevard Inventé',
      receiverAddress2: '',
      receiverPostalCode: '8000',
      receiverCity: 'Genève',
      receiverCountry: 'Suisse',
      receiverPhone: '0304050607',
    },
  };

  const countries = [
    "Afghanistan", "Albanie", "Algérie", "Andorre", "Angola", "Antigua-et-Barbuda", "Argentine", "Arménie", "Australie", "Autriche",
    "Azerbaïdjan", "Bahamas", "Bahreïn", "Bangladesh", "Barbade", "Biélorussie", "Belgique", "Belize", "Bénin", "Bhoutan",
    "Bolivie", "Bosnie-Herzégovine", "Botswana", "Brésil", "Brunei", "Bulgarie", "Burkina Faso", "Burundi", "Cambodge",
    "Cameroun", "Canada", "Cap-Vert", "République centrafricaine", "Tchad", "Chili", "Chine", "Colombie", "Comores", "Congo-Brazzaville",
    "Congo-Kinshasa", "Costa Rica", "Croatie", "Cuba", "Chypre", "République tchèque", "Danemark", "Djibouti", "Dominique", "République dominicaine",
    "Timor oriental", "Équateur", "Égypte", "Salvador", "Guinée équatoriale", "Érythrée", "Estonie", "Eswatini", "Éthiopie", "Fidji",
    "Finlande", "France", "Gabon", "Gambie", "Géorgie", "Allemagne", "Ghana", "Grèce", "Grenade", "Guatemala",
    "Guinée", "Guinée-Bissau", "Guyana", "Haïti", "Honduras", "Hongrie", "Islande", "Inde", "Indonésie", "Iran",
    "Irak", "Irlande", "Israël", "Italie", "Jamaïque", "Japon", "Jordanie", "Kazakhstan", "Kenya", "Kiribati",
    "Corée du Nord", "Corée du Sud", "Koweït", "Kirghizistan", "Laos", "Lettonie", "Liban", "Lesotho", "Libéria", "Libye",
    "Liechtenstein", "Lituanie", "Luxembourg", "Madagascar", "Malawi", "Malaisie", "Maldives", "Mali", "Malte", "Îles Marshall",
    "Mauritanie", "Maurice", "Mexique", "Micronésie", "Moldavie", "Monaco", "Mongolie", "Monténégro", "Maroc", "Mozambique",
    "Myanmar", "Namibie", "Nauru", "Népal", "Pays-Bas", "Nouvelle-Zélande", "Nicaragua", "Niger", "Nigéria", "Norvège",
    "Oman", "Pakistan", "Palaos", "Panama", "Papouasie-Nouvelle-Guinée", "Paraguay", "Pérou", "Philippines", "Pologne", "Portugal",
    "Qatar", "Roumanie", "Russie", "Rwanda", "Saint-Kitts-et-Nevis", "Sainte-Lucie", "Saint-Vincent-et-les Grenadines", "Samoa", "Saint-Marin", "Sao Tomé-et-Principe",
    "Arabie saoudite", "Sénégal", "Serbie", "Seychelles", "Sierra Leone", "Singapour", "Slovaquie", "Slovénie", "Îles Salomon", "Somalie",
    "Afrique du Sud", "Soudan du Sud", "Espagne", "Sri Lanka", "Soudan", "Suriname", "Suède", "Suisse", "Syrie", "Taïwan",
    "Tadjikistan", "Tanzanie", "Thaïlande", "Togo", "Tonga", "Trinité-et-Trinidad", "Tunisie", "Turquie", "Turkménistan", "Tuvalu",
    "Ouganda", "Ukraine", "Émirats arabes unis", "Royaume-Uni", "États-Unis", "Uruguay", "Ouzbékistan", "Vanuatu", "Vatican", "Venezuela",
    "Viêt Nam", "Yémen", "Zambie", "Zimbabwe"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    const isTransportSelected =
      values.transportModes.air ||
      values.transportModes.terre ||
      values.transportModes.mer ||
      values.transportModes.mixte;
    if (!isTransportSelected) {
      setErrorMessage("Veuillez sélectionner au moins un mode de transport.");
      return;
    }

    if (values.merchandises.length === 0) {
      setErrorMessage("Veuillez ajouter au moins une marchandise.");
      return;
    }

    setErrorMessage(''); // Réinitialiser le message d'erreur
    nextStep();
  };

  const addMerchandise = () => {
    // Vérification que tous les champs sont remplis
    if (!values.designation || !values.quantity || !values.boxReference) return;

    const newMerchandise = {
      designation: values.designation,
      boxReference: values.boxReference,
      quantity: values.quantity,
      unit: values.unit,
    };

    handleMerchandiseChange(newMerchandise);
    // Réinitialiser les champs dans values
    handleChange('designation', '');
    handleChange('quantity', '');
    handleChange('boxReference', '');
    handleChange('unit', 'kg poids brut - gros');
  };

  const removeMerchandise = (index) => {
    const updatedMerchandises = values.merchandises.filter((_, i) => i !== index);
    handleChange('merchandises', updatedMerchandises);
  };

  const handleFakeCompanySelect = (e) => {
    const selectedCompany = e.target.value;
    setSelectedFakeCompany(selectedCompany);
    const companyData = fakeCompanies[selectedCompany];
    if (companyData) {
      // Mettre à jour tous les champs pertinents dans values
      handleChange('receiverName', companyData.receiverName);
      handleChange('receiverAddress', companyData.receiverAddress);
      handleChange('receiverAddress2', companyData.receiverAddress2);
      handleChange('receiverPostalCode', companyData.receiverPostalCode);
      handleChange('receiverCity', companyData.receiverCity);
      handleChange('receiverCountry', companyData.receiverCountry);
      handleChange('receiverPhone', companyData.receiverPhone);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="step-form">
      <h3>{t('step1.title')}</h3>


      {/* Nouveau champ pour le libellé de la commande */}
      <div className="form-group">
        <div className='section-title' htmlFor="orderdiv">
          Libellé de la commande <span className="required">*</span>
        </div>
        <input
          id="orderLabel"
          type="text"
          value={values.orderLabel}
          onChange={(e) => handleChange('orderLabel', e.target.value)}
          required
        />
      </div>

      {/* Section 1/8 Demandeur */}
      <div className="section-title">{t('step1.exporterTitle')}</div>

      {/* Affichage du nom de l'entreprise demandeur en bleu */}
      <p className="exporter-name">INDIGO TRADING FZCO</p>

      <hr />

      {/* Section 2/8 Destinataire */}
      <div className="section-title">{t('step1.receiverTitle')}</div>

      <div className="form-group">
        <label>
          <input
            type="radio"
            name="destinataire"
            value="choisir"
            onChange={() => setIsNewDestinataire(false)}
          />{' '}
          {t('step1.chooseReceiver')}
        </label>
        <label>
          <input
            type="radio"
            name="destinataire"
            value="saisir"
            defaultChecked
            onChange={() => setIsNewDestinataire(true)}
          />{' '}
          {t('step1.enterNewReceiver')}
        </label>
      </div>

      {!isNewDestinataire && (
        <div className="form-group">
          <label>Choisir une entreprise *</label>
          <select
            value={selectedFakeCompany}
            onChange={handleFakeCompanySelect}
            required
          >
            <option value="">-- Sélectionnez une entreprise --</option>
            <option value="Entreprise Factice A">Entreprise Factice A</option>
            <option value="Entreprise Factice B">Entreprise Factice B</option>
            <option value="Entreprise Factice C">Entreprise Factice C</option>
          </select>
        </div>
      )}

      {isNewDestinataire && (
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={saveRecipient}
              onChange={(e) => setSaveRecipient(e.target.checked)}
            />{' '}
            Sauvegarder ce destinataire pour réutilisation future
          </label>
        </div>
      )}

      {isNewDestinataire && (
        <>
          <div className="form-group-row">
            <div className="form-group">
              <label>{t('step1.companyName')} *</label>
              <input
                type="text"
                value={values.receiverName}
                onChange={(e) => handleChange('receiverName', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label>{t('step1.address')} *</label>
              <input
                type="text"
                value={values.receiverAddress}
                onChange={(e) => handleChange('receiverAddress', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>{t('step1.addressNext')}</label>
              <input
                type="text"
                value={values.receiverAddress2}
                onChange={(e) => handleChange('receiverAddress2', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label>{t('step1.postalCode')} *</label>
              <input
                type="text"
                value={values.receiverPostalCode}
                onChange={(e) => handleChange('receiverPostalCode', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>{t('step1.city')} *</label>
              <input
                type="text"
                value={values.receiverCity}
                onChange={(e) => handleChange('receiverCity', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>{t('step1.country')} *</label>
              <select
                value={values.receiverCountry}
                onChange={(e) => handleChange('receiverCountry', e.target.value)}
                required
              >
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Numéro de téléphone */}
          <div className="form-group">
            <label>Numéro de téléphone *</label>
            <input
              type="tel"
              value={values.receiverPhone}
              onChange={(e) => handleChange('receiverPhone', e.target.value)}
              required
            />
          </div>
        </>
      )}

      <hr />

      {/* Section 3/8 Origine de la marchandise */}
      <div className="section-title">3/8 Origine de la marchandise</div>
      <div className="form-group">
        <label>Pays d'origine de la marchandise *</label>
        <select
          value={values.goodsOrigin}
          onChange={(e) => handleChange('goodsOrigin', e.target.value)}
          required
        >
          <option value="">-- Sélectionnez un pays --</option>
          {countries.map((country) => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Pays de destination de la marchandise *</label>
        <select
          value={values.goodsDestination}
          onChange={(e) => handleChange('goodsDestination', e.target.value)}
          required
        >
          <option value="">-- Sélectionnez un pays --</option>
          {countries.map((country) => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
      </div>

      <hr />

      {/* Section 4/8 Modes de transport */}
      <div className="section-title">4/8 Modes de transport</div>
      <div className="form-group">
        <label>Modes de transport</label>
        <div className="transport-options">
          <label>
            <input
              type="checkbox"
              checked={values.transportModes.air}
              onChange={(e) => handleChange('transportModes', { ...values.transportModes, air: e.target.checked })}
            /> Air
          </label>
          <label>
            <input
              type="checkbox"
              checked={values.transportModes.mer}
              onChange={(e) => handleChange('transportModes', { ...values.transportModes, mer: e.target.checked })}
            /> Mer
          </label>
          <label>
            <input
              type="checkbox"
              checked={values.transportModes.terre}
              onChange={(e) => handleChange('transportModes', { ...values.transportModes, terre: e.target.checked })}
            /> Terre
          </label>
          <label>
            <input
              type="checkbox"
              checked={values.transportModes.mixte}
              onChange={(e) => handleChange('transportModes', { ...values.transportModes, mixte: e.target.checked })}
            /> Mixte
          </label>
        </div>
      </div>

      {/* Remarques sur le transport */}
      <div className="form-group">
        <label>Remarques sur le transport</label>
        <textarea
          value={values.transportRemarks}
          onChange={(e) => handleChange('transportRemarks', e.target.value)}
          
        />
      </div>
      <hr />

      {/* Section 5/8 Déscription des marchandises */}
      <div className="section-title">5/8 Déscription des marchandises</div>
      <div className="form-group-row">
        <div className="form-group">
          <label>Référence / HSCODE</label> {/* Nouveau champ pour la référence */}
          <input
            type="text"
            value={values.boxReference}
            onChange={(e) => handleChange('boxReference', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Nature de la marchandise</label>
          <input
            type="text"
            value={values.designation}
            onChange={(e) => handleChange('designation', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Quantité</label>
          <input
            type="number"
            value={values.quantity}
            onChange={(e) => handleChange('quantity', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Unité</label>
          <select
            value={values.unit}
            onChange={(e) => handleChange('unit', e.target.value)}
          >
            <option value="kg">Kg</option>
            <option value="Tonne">Tonne</option>
            <option value="MTonne">Mtonne</option>
            <option value="unit2">Autre unité</option>
          </select>
        </div>

        <div className="form-group">
          <label>Référence document justificatif</label>
          <input
            type="text"
            value={values.reference}
            onChange={(e) => handleChange('reference', e.target.value)}
          />
        </div>

        <div className="form-group button-group-inline">
          <button type="button" onClick={addMerchandise}>
            Ajouter la marchandise
          </button>
        </div>
      </div>

      {/* Render list of added merchandises */}
      {values.merchandises.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>Désignation</th>
              <th>Référence</th>
              <th>Quantité</th>
              <th>Unité</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {values.merchandises.map((merchandise, index) => (
              <tr key={index}>
                <td>{merchandise.designation}</td>
                <td>{merchandise.boxReference}</td>
                <td>{merchandise.quantity}</td>
                <td>{merchandise.unit}</td>
                <td>
                  <button type="button" onClick={() => removeMerchandise(index)}>❌</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <hr />

      {/* Section 6/8 Nb d'exemplaires */}
      <div className="section-title">6/8 Nombre de copie certifié</div>
      <div className="form-group">
        <input
          type="number"
          value={values.copies}
          onChange={(e) => handleChange('copies', e.target.value)}
          min="1"
          required
        />
      </div>

      <hr />

      {/* Section 7/8 Engagement */}
      <div className="section-title">7/8 Engagement</div>
      <p>
        En validant ces conditions générales d'utilisation vous demandez la délivrance du certificat d'origine
        pour les marchandises figurant en case 6, dont l'origine est indiquée en case 3.
      </p>
      <p>
        Vous vous engagez à ce que tous les éléments et renseignements fournis ainsi que les éventuelles pièces
        justificatives présentées soient exactes, que les marchandises auxquelles se rapportent ces renseignements
        soient celles pour lesquelles le certificat d'origine est demandé et que ces marchandises remplissent les
        conditions prévues par la réglementation relative à la définition de la notion d'origine des marchandises.
      </p>
      <div className="form-group">
        {/* Placement du label à côté de la checkbox */}
        <label>
          <input
            type="checkbox"
            checked={values.isCommitted}
            onChange={(e) => handleChange('isCommitted', e.target.checked)}
          /> Je certifie m'engager dans les conditions décrites ci-dessus
        </label>
      </div>

      <hr/>

      {/* Section 8/8 Remarques */}
      <div className="section-title">8/8 REMARQUES</div>
      <div className="form-group">
        <label>Remarques</label>
        <textarea
          value={values.remarks}
          onChange={(e) => handleChange('remarks', e.target.value)}
          placeholder="Ajouter une remarque"
        />
      </div>
      <div className="character-counter">
        Caractère(s) restant(s) : {300 - (values.remarks ? values.remarks.length : 0)}
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <div className="button-group">
        <button type="button" className="previous-button">Retour</button>
        <button type="submit" className="submit-button">Enregistrer et continuer</button>
      </div>
    </form>
  );
};

export default Step1;
