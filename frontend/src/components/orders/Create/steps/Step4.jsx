import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getFilesRepoTypeofInfo, setOrderFiles } from '../../../../services/apiServices';
import './Step4.css';

const Step4 = ({ nextStep, prevStep, handleChange, values }) => {
  // Récupération des paramètres d'URL
  const params = new URLSearchParams(window.location.search);
  const certifId = params.get('certifId');
  const orderId = values.orderId;

  // Récupération de l'utilisateur depuis Redux
  const user = useSelector((state) => state.auth.user);
  const idloginInsert = user?.id_login_user;

  // États locaux
  const [copies, setCopies] = useState(values.copies || 1);
  const [generalRemark, setGeneralRemark] = useState(values.generalRemark || '');
  const [mandatoryUploads, setMandatoryUploads] = useState({});
  const [optionalUploads, setOptionalUploads] = useState({});
  const [mandatoryFileTypes, setMandatoryFileTypes] = useState([]);
  const [optionalFileTypes, setOptionalFileTypes] = useState([]);

  // Récupération des types de fichiers depuis le backend
  useEffect(() => {
    const fetchFileTypes = async () => {
      try {
        // Documents obligatoires
        const mandatoryResponse = await getFilesRepoTypeofInfo({
          p_id_files_repo_typeof_first: 500,
          p_id_files_repo_typeof_last: 649,
          p_ismandatory: true,
        });
        console.log("Mandatory file types:", mandatoryResponse.data);
        setMandatoryFileTypes(mandatoryResponse.data);

        // Documents optionnels
        const optionalResponse = await getFilesRepoTypeofInfo({
          p_id_files_repo_typeof_first: 500,
          p_id_files_repo_typeof_last: 649,
          p_ismandatory: false,
        });
        console.log("Optional file types:", optionalResponse.data);
        setOptionalFileTypes(optionalResponse.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des types de fichiers:", error);
      }
    };

    fetchFileTypes();
  }, []);

  // Gestion des changements pour les fichiers obligatoires
  const handleMandatoryFileChange = (fileTypeId, e) => {
    const file = e.target.files[0];
    setMandatoryUploads(prev => ({ ...prev, [fileTypeId]: file }));
  };

  // Gestion des changements pour les fichiers optionnels
  const handleOptionalFileChange = (fileTypeId, e) => {
    const file = e.target.files[0];
    setOptionalUploads(prev => ({ ...prev, [fileTypeId]: file }));
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Vérifier que tous les documents obligatoires sont présents
    for (let ft of mandatoryFileTypes) {
      if (!mandatoryUploads[ft.id_files_repo_typeof]) {
        alert(`Le document obligatoire "${ft.txt_description_fr}" est manquant.`);
        return;
      }
    }

    const mandatoryDocs = mandatoryFileTypes.map(ft => ({
      fileTypeId: ft.id_files_repo_typeof,
      fileTypeDescription: ft.txt_description_fr,
      file: mandatoryUploads[ft.id_files_repo_typeof],
    }));

    const optionalDocs = optionalFileTypes.reduce((acc, ft) => {
      if (optionalUploads[ft.id_files_repo_typeof]) {
        acc.push({
          fileTypeId: ft.id_files_repo_typeof,
          fileTypeDescription: ft.txt_description_fr,
          file: optionalUploads[ft.id_files_repo_typeof],
        });
      }
      return acc;
    }, []);

    const allDocs = [...mandatoryDocs, ...optionalDocs];

    try {
      // Upload de chaque document
      for (const doc of allDocs) {
        const orderFileData = {
          uploadType: 'commandes',
          p_id_order: orderId,
          p_idfiles_repo_typeof: doc.fileTypeId,
          p_file_origin_name: doc.file.name,
          p_typeof_order: 0,
          p_idlogin_insert: idloginInsert,
          file: doc.file,
        };

        await setOrderFiles(orderFileData);
      }

      // Sauvegarde des données dans l'état global et passage à l'étape suivante
      handleChange('documents', allDocs);
      handleChange('copies', copies);
      handleChange('generalRemark', generalRemark);
      if (certifId) handleChange('certifId', certifId);
      if (orderId) handleChange('orderId', orderId);

      nextStep();
    } catch (error) {
      console.error("Erreur lors de l'upload des fichiers:", error);
      alert("Erreur lors de l'upload des fichiers. Veuillez réessayer.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="step5-form">
      <h2 className="step5-title">Étape 2 : Pièces justificatives</h2>

      {/* Documents obligatoires */}
      <div className="step5-designation-commande">
        <h5 className="step5-sub-title">Documents obligatoires</h5>
        {mandatoryFileTypes.map(ft => (
          <div key={ft.id_files_repo_typeof} className="step5-form-group" style={{ marginBottom: '15px' }}>
            <label className="step5-form-group label">
              {ft.txt_description_fr} <br />
              <small style={{ color: '#777', fontSize: '12px' }}>{ft.txt_description_eng}</small>
            </label>
            <div>
              <input
                type="file"
                id={`mandatory-${ft.id_files_repo_typeof}`}
                style={{ display: 'none' }}
                onChange={(e) => handleMandatoryFileChange(ft.id_files_repo_typeof, e)}
                required
              />
              <label htmlFor={`mandatory-${ft.id_files_repo_typeof}`} className="step5-modifier-button">
                Choisir fichier
              </label>
              {mandatoryUploads[ft.id_files_repo_typeof] && (
                <span className="step5-file-name">
                  {mandatoryUploads[ft.id_files_repo_typeof].name}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Container pour documents optionnels et remarques générales */}
      <div className="step5-designation-commande" style={{ marginTop: '30px' }}>
        {optionalFileTypes.length > 0 && (
          <>
            <h5 className="step5-sub-title">Documents optionnels</h5>
            {optionalFileTypes.map(ft => (
              <div key={ft.id_files_repo_typeof} className="step5-form-group" style={{ marginBottom: '15px' }}>
                <label className="step5-form-group label">
                  {ft.txt_description_fr} <br />
                  <small style={{ color: '#777', fontSize: '12px' }}>{ft.txt_description_eng}</small>
                </label>
                <div>
                  <input
                    type="file"
                    id={`optional-${ft.id_files_repo_typeof}`}
                    style={{ display: 'none' }}
                    onChange={(e) => handleOptionalFileChange(ft.id_files_repo_typeof, e)}
                  />
                  <label htmlFor={`optional-${ft.id_files_repo_typeof}`} className="step5-modifier-button">
                    Choisir fichier
                  </label>
                  {optionalUploads[ft.id_files_repo_typeof] && (
                    <span className="step5-file-name">
                      {optionalUploads[ft.id_files_repo_typeof].name}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {/* Remarques générales intégrées dans le même rectangle */}
        <div className="step5-form-group" style={{ marginTop: '30px', flexDirection: 'column', alignItems: 'flex-start' }}>
          <label className="step5-form-group label">Remarques générales</label>
          <textarea
            value={generalRemark}
            onChange={(e) => setGeneralRemark(e.target.value)}
            placeholder="Ajouter des remarques générales pour les pièces justificatives"
            className="step5-editable-input step5-white-input"
            style={{ minHeight: '80px', width: '100%' }}
          />
        </div>
      </div>

      {/* Boutons d'action : Retour à gauche, Suivant à droite, même taille */}
      <div className="step5-action-buttons">
        <button type="button" onClick={prevStep} className="step5-action-button step5-action-button--left">
          Retour
        </button>
        <button type="submit" className="step5-action-button step5-action-button--right">
          Suivant
        </button>
      </div>
    </form>
  );
};

export default Step4;
