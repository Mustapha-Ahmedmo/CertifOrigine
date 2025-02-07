import React, { useEffect, useState } from 'react';
import { getFilesRepoTypeofInfo } from '../../../../services/apiServices';

const Step3 = ({ nextStep, prevStep, handleChange, values }) => {
  const [copies, setCopies] = useState(values.copies || 1);
  const [file, setFile] = useState(values.file || null);
  const [mandatoryFileTypes, setMandatoryFileTypes] = useState([]);
  const [optionalFileTypes, setOptionalFileTypes] = useState([]);
  const [selectedFileType, setSelectedFileType] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    handleChange('copies', copies);
    handleChange('file', file);
    nextStep();
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };


  useEffect(() => {
    const fetchMandatoryFileTypes = async () => {
      try {
        const response = await getFilesRepoTypeofInfo({
          p_id_files_repo_typeof_first: 500,
          p_id_files_repo_typeof_last: 649,
          p_ismandatory: true,
          p_id_files_repo_typeof_list: null,
        });
        console.log("Mandatory file types:", response.data);
        setMandatoryFileTypes(response.data);
        if (response.data && response.data.length > 0) {
          // Set default selected file type (using the id)
          setSelectedFileType(response.data[0].id_files_repo_typeof.toString());
        }
      } catch (error) {
        console.error("Error fetching mandatory file types:", error);
      }
    };

    const fetchOptionalFileTypes = async () => {
      try {
        const response = await getFilesRepoTypeofInfo({
          p_id_files_repo_typeof_first: 500,
          p_id_files_repo_typeof_last: 649,
          p_ismandatory: false,
          p_id_files_repo_typeof_list: null,
        });
        console.log("Optional file types:", response.data);
        setOptionalFileTypes(response.data);
      } catch (error) {
        console.error("Error fetching optional file types:", error);
      }
    };

    fetchMandatoryFileTypes();
    fetchOptionalFileTypes();
  }, []);

  return (
    <form onSubmit={handleSubmit} className="step-form">
      <h3>Étape 3 : Nombre de copies certifiées & Type de document</h3>

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

      <div className="form-group">
        <label>Télécharger le fichier</label>
        <label htmlFor="file-upload" className="custom-file-upload">
          Choisir le fichier
        </label>
        <input
          id="file-upload"
          type="file"
          onChange={handleFileChange}
          className="file-input"
          required
        />
        {file && <p>Fichier sélectionné : {file.name}</p>}
      </div>

      <div className="form-group">
        <label>Type de document (obligatoire)</label>
        <select
          value={selectedFileType}
          onChange={(e) => setSelectedFileType(e.target.value)}
          required
        >
          {mandatoryFileTypes.map((type) => (
            <option key={type.id_files_repo_typeof} value={type.id_files_repo_typeof}>
              {type.txt_description_fr} - {type.txt_description_eng}
            </option>
          ))}
        </select>
      </div>

      {optionalFileTypes.length > 0 && (
        <div className="form-group">
          <label>Types de document optionnels</label>
          <ul>
            {optionalFileTypes.map((type) => (
              <li key={type.id_files_repo_typeof}>
                {type.txt_description_fr} - {type.txt_description_eng}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="step-actions">
        <button type="button" onClick={prevStep}>
          Back
        </button>
        <button type="submit" className="next-button">
          Next
        </button>
      </div>
    </form>
  );
};

export default Step3;
