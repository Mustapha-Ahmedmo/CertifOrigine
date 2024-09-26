import React, { useEffect, useState } from 'react';
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step3 from './steps/Step3';
import Step4 from './steps/Step4';
import Step5 from './steps/Step5';
import { generatePDF } from '../GeneratePDF';
import './CreateOrder.css';

const CreateOrder = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    orderName: '',  
    merchandises: [], 
    remarks: '',
    transportModes: {  // Ajout des modes de transport ici
      air: false,
      mer: false,
      terre: false,
    },
    isPaperCopy: false,
    isTemplate: false,
    exporterName: '',
    exporterCompany2: '',
    exporterAddress: '',
    exporterAddress2: '',
    exporterPostalCode: '',
    exporterCity: '',
    exporterCountry: '',
    receiverName: '',
    receiverCompany2: '',
    receiverAddress: '',
    receiverAddress2: '',
    receiverPostalCode: '',
    receiverCity: '',
    receiverCountry: '',
  });

  useEffect(() => {
    console.log('formData updated:', formData);
  }, [formData]);

  const nextStep = () => {
    setCurrentStep((prevStep) => (prevStep < 5 ? prevStep + 1 : prevStep));
  };

  const prevStep = () => {
    setCurrentStep((prevStep) => (prevStep > 1 ? prevStep - 1 : prevStep));
  };

  const handleChange = (input, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [input]: value,
    }));
  };

  const handleMerchandiseChange = (newMerchandise) => {
    setFormData((prevState) => ({
      ...prevState,
      merchandises: [...prevState.merchandises, newMerchandise],
    }));
  };

  const handleSubmit = () => {
    console.log('Order Submitted:', formData);
    generatePDF(formData);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1
            nextStep={nextStep}
            handleMerchandiseChange={handleMerchandiseChange}
            handleChange={handleChange}
            values={formData}
          />
        );
      case 2:
        return (
          <Step4 nextStep={nextStep} prevStep={prevStep} handleChange={handleChange} values={formData} />
        );
      case 3:
        return (
          <Step3 nextStep={nextStep} prevStep={prevStep} handleChange={handleChange} values={formData} />
        );
      case 4:
        return (
          <Step4 nextStep={nextStep} prevStep={prevStep} handleChange={handleChange} values={formData} />
        );
      case 5:
        return (
          <Step5 prevStep={prevStep} values={formData} handleSubmit={handleSubmit} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="create-order-container">
      <div className="steps-progress">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className={`step-item ${currentStep >= step ? 'completed' : ''}`}>
            <div className="step-circle">{currentStep > step ? '✔️' : step}</div>
            <div className="step-label">
              {step === 1 && 'ÉTAPE1\nCRÉATION D\'UNE COMMANDE'}
              {step === 2 && 'ÉTAPE2\nDÉTAILS DU PRODUIT'}
              {step === 3 && 'ÉTAPE3\nLIVRAISON ET FACTURATION'}
              {step === 4 && 'ÉTAPE4\nFINALISATION DE LA COMMANDE'}
            </div>
          </div>
        ))}
      </div>
      <div className="step-content">{renderStep()}</div>
    </div>
  );
};

export default CreateOrder;