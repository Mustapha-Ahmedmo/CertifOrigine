import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getFilesRepoTypeofInfo, setOrderFiles } from '../../../../services/apiServices';
import './Step4.css';

const Step4 = ({ nextStep, prevStep, handleChange, values }) => {
  // Extract query parameters (e.g. certifId and orderId)
  const params = new URLSearchParams(window.location.search);
  const certifId = params.get('certifId');
  const orderId = values.orderId; // Assume the order ID is passed in values

  // Get user data from Redux
  const user = useSelector((state) => state.auth.user);
  const idloginInsert = user?.id_login_user;

  // Local state for copies and general remark
  const [copies, setCopies] = useState(values.copies || 1);
  const [generalRemark, setGeneralRemark] = useState(values.generalRemark || '');

  // State for holding file uploads (objects keyed by file type ID)
  const [mandatoryUploads, setMandatoryUploads] = useState({});
  const [optionalUploads, setOptionalUploads] = useState({});

  // State for file repository types (fetched from the backend)
  const [mandatoryFileTypes, setMandatoryFileTypes] = useState([]);
  const [optionalFileTypes, setOptionalFileTypes] = useState([]);

  // Fetch file types on mount
  useEffect(() => {
    const fetchFileTypes = async () => {
      try {
        // Fetch mandatory file types (IDs between 500 and 649, where p_ismandatory = true)
        const mandatoryResponse = await getFilesRepoTypeofInfo({
          p_id_files_repo_typeof_first: 500,
          p_id_files_repo_typeof_last: 649,
          p_ismandatory: true,
        });
        console.log("Mandatory file types:", mandatoryResponse.data);
        setMandatoryFileTypes(mandatoryResponse.data);

        // Fetch optional file types (IDs between 500 and 649, where p_ismandatory = false)
        const optionalResponse = await getFilesRepoTypeofInfo({
          p_id_files_repo_typeof_first: 500,
          p_id_files_repo_typeof_last: 649,
          p_ismandatory: false,
        });
        console.log("Optional file types:", optionalResponse.data);
        setOptionalFileTypes(optionalResponse.data);
      } catch (error) {
        console.error("Error fetching file types:", error);
      }
    };

    fetchFileTypes();
  }, []);

  // Handlers for file input changes
  const handleMandatoryFileChange = (fileTypeId, e) => {
    const file = e.target.files[0];
    setMandatoryUploads(prev => ({ ...prev, [fileTypeId]: file }));
  };

  const handleOptionalFileChange = (fileTypeId, e) => {
    const file = e.target.files[0];
    setOptionalUploads(prev => ({ ...prev, [fileTypeId]: file }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Ensure all mandatory file types have a file uploaded
    for (let ft of mandatoryFileTypes) {
      if (!mandatoryUploads[ft.id_files_repo_typeof]) {
        alert(`Le document obligatoire "${ft.txt_description_fr}" est manquant.`);
        return;
      }
    }
  
    // Build arrays for mandatory and optional docs as before
    const mandatoryDocs = mandatoryFileTypes.map((ft) => ({
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
      // Loop through each document and upload it
      for (const doc of allDocs) {
        const orderFileData = {
          uploadType: 'commandes', // this must be included as a text field
          p_id_order: orderId,
          p_idfiles_repo_typeof: doc.fileTypeId,
          p_file_origin_name: doc.file.name,
          p_typeof_order: 0,
          p_idlogin_insert: idloginInsert,
          file: doc.file,
        };
  
        await setOrderFiles(orderFileData);
      }
  
      // Save additional data into global state as needed
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
    <form onSubmit={handleSubmit} className="step-form">
      <h3>Étape 4: Pièces justificatives</h3>

      {/* Number of Certified Copies */}
      <div className="form-group">
        <label>Nombre de copies certifiées</label>
        <input
          type="number"
          value={copies}
          onChange={(e) => setCopies(e.target.value)}
          min="1"
          required
        />
      </div>

      {/* Mandatory Documents Section */}
      <h4>Documents obligatoires</h4>
      {mandatoryFileTypes.map((ft) => (
        <div key={ft.id_files_repo_typeof} className="document-row">
          <div className="document-label">
            {ft.txt_description_fr} - {ft.txt_description_eng}
          </div>
          <div className="document-input">
            <input
              type="file"
              onChange={(e) => handleMandatoryFileChange(ft.id_files_repo_typeof, e)}
              required
            />
          </div>
        </div>
      ))}

      {/* Optional Documents Section */}
      <h4>Documents optionnels</h4>
      {optionalFileTypes.map((ft) => (
        <div key={ft.id_files_repo_typeof} className="document-row">
          <div className="document-label">
            {ft.txt_description_fr} - {ft.txt_description_eng}
          </div>
          <div className="document-input">
            <input
              type="file"
              onChange={(e) => handleOptionalFileChange(ft.id_files_repo_typeof, e)}
            />
          </div>
        </div>
      ))}

      {/* General Remark */}
      <div className="form-group">
        <label>Remarques générales</label>
        <textarea
          value={generalRemark}
          onChange={(e) => setGeneralRemark(e.target.value)}
          placeholder="Ajouter des remarques générales pour les pièces justificatives"
        />
      </div>

      {/* Form Actions */}
      <div className="step-actions">
        <button type="button" onClick={prevStep}>Retour</button>
        <button type="submit" className="next-button">Suivant</button>
      </div>
    </form>
  );
};

export default Step4;