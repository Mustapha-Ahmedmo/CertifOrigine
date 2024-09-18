import React, { useState } from 'react';
import './Step1.css';

const Step1 = ({ nextStep, handleMerchandiseChange, handleChange, values }) => {
  const [designation, setDesignation] = useState('');
  const [unit, setUnit] = useState('kg poids brut - gros');
  const [quantity, setQuantity] = useState('');
  const [isNewExporter, setIsNewExporter] = useState(true); // Pour gérer exportateur
  const [isNewDestinataire, setIsNewDestinataire] = useState(true); // Pour gérer destinataire
  const [errorMessage, setErrorMessage] = useState('');

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
    "Tadjikistan", "Tanzanie", "Thaïlande", "Togo", "Tonga", "Trinité-et-Tobago", "Tunisie", "Turquie", "Turkménistan", "Tuvalu",
    "Ouganda", "Ukraine", "Émirats arabes unis", "Royaume-Uni", "États-Unis", "Uruguay", "Ouzbékistan", "Vanuatu", "Vatican", "Venezuela",
    "Viêt Nam", "Yémen", "Zambie", "Zimbabwe"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    const isTransportSelected = values.transportModes.air || values.transportModes.terre || values.transportModes.mer;
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
    // Make sure designation and quantity are provided
    if (!designation || !quantity) return;

    const newMerchandise = {
      designation,
      quantity,
      unit
    };

    handleMerchandiseChange(newMerchandise);
    setDesignation('');
    setQuantity('');
    setUnit('kg poids brut - gros');
  };

  const removeMerchandise = (index) => {
    const updatedMerchandises = values.merchandises.filter((_, i) => i !== index);
    handleChange('merchandises', updatedMerchandises);
  };

  return (
    <form onSubmit={handleSubmit} className="step-form">
      <h3>ÉTAPE 1 - DÉTAILS DU CERTIFICAT D'ORIGINE</h3>

      {/* Champ Order Name */}
      <div className="form-group">
        <label>Nom de la commande *</label>
        <input
          type="text"
          value={values.orderName}
          onChange={(e) => handleChange('orderName', e.target.value)}
          required
        />
      </div>

      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      <div className="section-title">1/9 EXPORTATEUR</div>

      {/* Choisir ou saisir un exportateur */}
      <div className="form-group">
        <label>
          <input
            type="radio"
            name="exportateur"
            value="choisir"
            onChange={() => setIsNewExporter(false)}
          /> Choisir un exportateur
        </label>
        <label>
          <input
            type="radio"
            name="exportateur"
            value="saisir"
            defaultChecked
            onChange={() => setIsNewExporter(true)}
          /> Saisir un nouveau exportateur
        </label>
      </div>

      {/* Afficher les champs uniquement si "Saisir un nouveau exportateur" est sélectionné */}
      {isNewExporter && (
        <>
          <div className="form-group-row">
            <div className="form-group">
              <label>Raison sociale *</label>
              <input
                type="text"
                value={values.exporterName}
                onChange={(e) => handleChange('exporterName', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Raison sociale 2</label>
              <input
                type="text"
                value={values.exporterCompany2}
                onChange={(e) => handleChange('exporterCompany2', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label>Adresse *</label>
              <input
                type="text"
                value={values.exporterAddress}
                onChange={(e) => handleChange('exporterAddress', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Complément d'adresse</label>
              <input
                type="text"
                value={values.exporterAddress2}
                onChange={(e) => handleChange('exporterAddress2', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label>C.P *</label>
              <input
                type="text"
                value={values.exporterPostalCode}
                onChange={(e) => handleChange('exporterPostalCode', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Ville *</label>
              <input
                type="text"
                value={values.exporterCity}
                onChange={(e) => handleChange('exporterCity', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Pays *</label>
              <select
                value={values.exporterCountry}
                onChange={(e) => handleChange('exporterCountry', e.target.value)}
                required
              >
                {countries.map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>
              <input type="checkbox" /> Afficher la mention "Union Européenne" sur le document à côté du pays de l'exportateur ?
            </label>
          </div>
        </>
      )}

      <hr />

      <div className="section-title">2/9 DESTINATAIRE</div>

      {/* Choisir ou saisir un destinataire */}
      <div className="form-group">
        <label>
          <input
            type="radio"
            name="destinataire"
            value="choisir"
            onChange={() => setIsNewDestinataire(false)}
          /> Choisir un destinataire
        </label>
        <label>
          <input
            type="radio"
            name="destinataire"
            value="saisir"
            defaultChecked
            onChange={() => setIsNewDestinataire(true)}
          /> Saisir un nouveau destinataire
        </label>
      </div>

      {/* Afficher les champs uniquement si "Saisir un nouveau destinataire" est sélectionné */}
      {isNewDestinataire && (
        <>
          <div className="form-group-row">
            <div className="form-group">
              <label>Raison sociale *</label>
              <input
                type="text"
                value={values.receiverName}
                onChange={(e) => handleChange('receiverName', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Raison sociale 2</label>
              <input
                type="text"
                value={values.receiverCompany2}
                onChange={(e) => handleChange('receiverCompany2', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label>Adresse *</label>
              <input
                type="text"
                value={values.receiverAddress}
                onChange={(e) => handleChange('receiverAddress', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Complément d'adresse</label>
              <input
                type="text"
                value={values.receiverAddress2}
                onChange={(e) => handleChange('receiverAddress2', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label>C.P *</label>
              <input
                type="text"
                value={values.receiverPostalCode}
                onChange={(e) => handleChange('receiverPostalCode', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Ville *</label>
              <input
                type="text"
                value={values.receiverCity}
                onChange={(e) => handleChange('receiverCity', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Pays *</label>
              <select
                value={values.receiverCountry}
                onChange={(e) => handleChange('receiverCountry', e.target.value)}
                required
              >
                {countries.map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}

      <hr />

      {/* Section 3/9 Origine de la marchandise */}
      <div className="section-title">3/9 ORIGINE DE LA MARCHANDISE</div>
      <div className="form-group">
        <label>Origine de la marchandise *</label>
        <select
          value={values.goodsOrigin}
          onChange={(e) => handleChange('goodsOrigin', e.target.value)}
          required
        >
          {countries.map((country) => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={values.showEuMention}
            onChange={(e) => handleChange('showEuMention', e.target.checked)}
          />
          Afficher la mention "Union Européenne" sur le document à côté du pays d'origine ?
        </label>
      </div>

      <hr />

      {/* Modes de transport */}
      <div className="section-title">4/9 MODES DE TRANSPORT</div>
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
        </div>
      </div>

      <hr />

      {/* Section 5/9 Remarques */}
      <div className="section-title">5/9 REMARQUES</div>
      <div className="form-group">
        <label>Remarques</label>
        <textarea
          value={values.remarks}
          onChange={(e) => handleChange('remarks', e.target.value)}
          placeholder="Ajouter une remarque"
        />
      </div>
      <div className="character-counter">
        Caractère(s) restant(s) : {300 - values.remarks.length}
      </div>

      <hr />

      {/* Section 6/9 Liste des marchandises */}
      <div className="section-title">6/9 LISTE DES MARCHANDISES</div>
      <div className="form-group-row">
        <div className="form-group">
          <label>Désignation</label>
          <input
            type="text"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Quantité</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Unité</label>
          <select
            value={values.unit}
            onChange={(e) => handleChange('unit', e.target.value)}
          >
            <option value="kg">kg poids brut - gros</option>
            <option value="unit2">Autre unité</option>
          </select>
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
              <th>Quantité</th>
              <th>Unité</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {values.merchandises.map((merchandise, index) => (
              <tr key={index}>
                <td>{merchandise.designation}</td>
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

      {/* Section 7/9 Nb d'exemplaires */}
      <div className="section-title">7/9 NB EXEMPLAIRES</div>
      <div className="form-group">
        <input
          type="checkbox"
          checked={values.isPaperCopy}
          onChange={(e) => handleChange('isPaperCopy', e.target.checked)}
        />
        <label>Vous souhaitez un exemplaire papier (1 original et 2 copies)</label>
      </div>

      <hr />

      {/* Section 8/9 Est un modèle */}
      <div className="section-title">8/9 EST UN MODÈLE</div>
      <div className="form-group">
        <input
          type="checkbox"
          checked={values.isTemplate}
          onChange={(e) => handleChange('isTemplate', e.target.checked)}
        />
        <label>Est un modèle</label>
      </div>

      <hr />

      {/* Section 9/9 Engagement */}
      <div className="section-title">9/9 ENGAGEMENT</div>
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
        <input
          type="checkbox"
          checked={values.isCommitted}
          onChange={(e) => handleChange('isCommitted', e.target.checked)}
        />
        <label>Je certifie m'engager dans les conditions décrites ci-dessus</label>
      </div>

      <div className="button-group">
        <button type="button" className="previous-button">Retour</button>
        <button type="submit" className="submit-button">Enregistrer et continuer</button>
      </div>
    </form>
  );
};

export default Step1;