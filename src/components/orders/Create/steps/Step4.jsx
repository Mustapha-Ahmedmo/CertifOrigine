import React, { useState } from 'react';

const Step4 = ({ nextStep, prevStep, handleChange, values }) => {
  const [documentName, setDocumentName] = useState('');
  const [documents, setDocuments] = useState(values.documents || []);

  const addDocument = () => {
    if (documentName) {
      setDocuments([...documents, documentName]);
      setDocumentName('');
    }
  };

  const removeDocument = (index) => {
    const updatedDocuments = documents.filter((_, i) => i !== index);
    setDocuments(updatedDocuments);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleChange('documents', documents);
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="step-form">
      <h3>Step 4: Pièces justificatives</h3>
      <div className="form-group">
        <input
          type="text"
          value={documentName}
          onChange={(e) => setDocumentName(e.target.value)}
          placeholder="Nom du document"
        />
        <button type="button" onClick={addDocument}>
          Add
        </button>
      </div>
      <ul className="document-list">
        {documents.map((doc, index) => (
          <li key={index}>
            {doc}{' '}
            <button type="button" onClick={() => removeDocument(index)}>
              ❌
            </button>
          </li>
        ))}
      </ul>
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

export default Step4;
