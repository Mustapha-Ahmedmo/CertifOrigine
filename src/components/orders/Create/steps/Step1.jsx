import React, { useState } from 'react';

const Step1 = ({ nextStep, handleChange, values }) => {
  const [orderName, setOrderName] = useState(values.orderName || ''); // Initialize with formData value
  const [productType, setProductType] = useState(values.productType || 'certificat'); // Initialize with formData value

  const handleSubmit = (e) => {
    e.preventDefault();
    handleChange('orderName', orderName); // Update formData with orderName
    handleChange('productType', productType); // Update formData with productType
    nextStep(); // Proceed to the next step
  };

  return (
    <form onSubmit={handleSubmit} className="step-form">
      <h3>Step 1: Command Details</h3>
      <div className="form-group">
        <label>Order Name</label>
        <input
          type="text"
          value={values.orderName} 
          onChange={(e) => {
            handleChange('orderName', e.target.value);
          }}
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