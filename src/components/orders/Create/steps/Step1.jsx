import React, { useState } from 'react';

const Step1 = ({ nextStep }) => {
  const [orderName, setOrderName] = useState('');
  const [productType, setProductType] = useState('certificat');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate and proceed to the next step
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="step-form">
      <h3>Step 1: Command Details</h3>
      <div className="form-group">
        <label>Order Name</label>
        <input
          type="text"
          value={orderName}
          onChange={(e) => setOrderName(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label>Product Type</label>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="productType"
              value="certificat"
              checked={productType === 'certificat'}
              onChange={() => setProductType('certificat')}
            />
            Certificat d'origine
          </label>
          <label>
            <input
              type="radio"
              name="productType"
              value="legalisation"
              checked={productType === 'legalisation'}
              onChange={() => setProductType('legalisation')}
            />
            Document de légalisation
          </label>
        </div>
      </div>
      <button type="submit" className="next-button">Next</button>
    </form>
  );
};

export default Step1;
