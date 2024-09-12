import React, { useEffect, useState } from 'react';
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step3 from './steps/Step3';
import Step4 from './steps/Step4';
import Step5 from './steps/Step5';
import { generatePDF } from '../GeneratePDF';
import './CreateOrder.css';  // Importation du fichier CSS

const CreateOrder = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    orderName: '',
    productType: '',
    originCountry: '',
    destinationCountry: '',
    transportModes: { truck: false, ship: false, plane: false, train: false },
    comment: '',
    merchandises: [],
    copies: 1,
    documents: [],
  });

  const steps = [
    { number: 1, label: 'Step 1: Nature de la Marchandise' },
    { number: 2, label: 'Step 2: Origine des marchandises' },
    { number: 3, label: 'Step 3: Nombre de copie certifié' },
    { number: 4, label: 'Step 4: Pièces justificatives' },
    { number: 5, label: 'Step 5: Récapitulatif' },
  ];
  
  const nextStep = () => {
    setCurrentStep((prevStep) => (prevStep < steps.length ? prevStep + 1 : prevStep));
  };

  const prevStep = () => {
    setCurrentStep((prevStep) => (prevStep > 1 ? prevStep - 1 : prevStep));
  };

  const handleChange = (input, value) => {
    setFormData({ ...formData, [input]: value });
  };

  const handleSubmit = () => {
    console.log('Order Submitted:', formData);
    generatePDF(formData); // Appeler la fonction pour générer le PDF lors du submit
  };

  useEffect(() => {
    console.log('Updated formData:', formData);
  }, [formData]); // Ce code s'exécutera chaque fois que formData est mis à jour

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1 nextStep={nextStep} handleChange={handleChange} values={formData} />;
      case 2:
        return <Step2 nextStep={nextStep} prevStep={prevStep} handleChange={handleChange} values={formData} />;
      case 3:
        return <Step3 nextStep={nextStep} prevStep={prevStep} handleChange={handleChange} values={formData} />;
      case 4:
        return <Step4 nextStep={nextStep} prevStep={prevStep} handleChange={handleChange} values={formData} />;
      case 5:
        return <Step5 prevStep={prevStep} values={formData} handleSubmit={handleSubmit} />;
      default:
        return null;
    }
  };

  return (
    <div className="create-order-container">
      <div className="steps-progress">
        {steps.map((step) => (
          <div key={step.number} className={`step ${currentStep === step.number ? 'active' : ''}`}>
            {step.label}
          </div>
        ))}
      </div>
      <div className="step-content">
        {renderStep()}
      </div>
    </div>
  );
};

export default CreateOrder;