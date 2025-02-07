import React, { useEffect, useState } from 'react';
import { getFilesRepoTypeofInfo } from '../../../../services/apiServices';
import './Step4.css';

const Step4 = ({ nextStep, prevStep, handleChange, values }) => {
  // State for certified copies and the general remark (one for the whole step)
  const [copies, setCopies] = useState(values.copies || 1);
  const [generalRemark, setGeneralRemark] = useState(values.generalRemark || '');

  // State to hold the file uploads for each file type
  // For mandatory uploads, keys are the file type IDs, and values are the File objects.
  const [mandatoryUploads, setMandatoryUploads] = useState({});
  // For optional uploads, keys are the file type IDs, and values are the File objects.
  const [optionalUploads, setOptionalUploads] = useState({});

  // State for file repository types (fetched from the backend)
  const [mandatoryFileTypes, setMandatoryFileTypes] = useState([]);
  const [optionalFileTypes, setOptionalFileTypes] = useState([]);

  // Fetch the file types on component mount
  useEffect(() => {
    const fetchFileTypes = async () => {
      try {
        // Fetch mandatory file types (IDs between 500 and 649, where p_ismandatory is true)
        const mandatoryResponse = await getFilesRepoTypeofInfo({
          p_id_files_repo_typeof_first: 500,
          p_id_files_repo_typeof_last: 649,
          p_ismandatory: true,
        });
        console.log("Mandatory file types:", mandatoryResponse.data);
        setMandatoryFileTypes(mandatoryResponse.data);

        // Fetch optional file types (IDs between 500 and 649, where p_ismandatory is false)
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

  // Handler for mandatory file input changes
  const handleMandatoryFileChange = (fileTypeId, e) => {
    const file = e.target.files[0];
    setMandatoryUploads(prev => ({
      ...prev,
      [fileTypeId]: file,
    }));
  };

  // Handler for optional file input changes
  const handleOptionalFileChange = (fileTypeId, e) => {
    const file = e.target.files[0];
    setOptionalUploads(prev => ({
      ...prev,
      [fileTypeId]: file,
    }));
  };

  // Form submission handler
  const handleSubmit = (e) => {
    e.preventDefault();

    // Ensure every mandatory file type has an uploaded file
    for (let ft of mandatoryFileTypes) {
      if (!mandatoryUploads[ft.id_files_repo_typeof]) {
        alert(`Le document obligatoire "${ft.txt_description_fr}" est manquant.`);
        return;
      }
    }

    // Build the documents array from mandatory uploads
    const mandatoryDocs = mandatoryFileTypes.map(ft => ({
      type: 'justificative',
      fileTypeId: ft.id_files_repo_typeof,
      fileTypeDescription: ft.txt_description_fr,
      file: mandatoryUploads[ft.id_files_repo_typeof],
    }));

    // Build the documents array from optional uploads (only include those with a file)
    const optionalDocs = optionalFileTypes.reduce((acc, ft) => {
      if (optionalUploads[ft.id_files_repo_typeof]) {
        acc.push({
          type: 'justificative',
          fileTypeId: ft.id_files_repo_typeof,
          fileTypeDescription: ft.txt_description_fr,
          file: optionalUploads[ft.id_files_repo_typeof],
        });
      }
      return acc;
    }, []);

    const allDocuments = [...mandatoryDocs, ...optionalDocs];

    // Pass the documents, copies, and the general remark to the parent component
    handleChange('documents', allDocuments);
    handleChange('copies', copies);
    handleChange('generalRemark', generalRemark);

    nextStep();
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
      {mandatoryFileTypes.map(ft => (
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
      {optionalFileTypes.map(ft => (
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