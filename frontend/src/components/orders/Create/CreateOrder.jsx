import React, { useEffect, useState } from 'react';
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
// Remarquez que votre "Step4" correspond à l'étape 3 dans la frise
import Step4 from './steps/Step4'; 
// Votre "Step5" correspond à l'étape 4 (Récap) dans la frise
import Step5 from './steps/Step5';

import { generatePDF } from '../GeneratePDF';
import './CreateOrder.css';
import { createOrder } from '../../../services/apiServices';
import { useSelector } from 'react-redux';

const CreateOrder = () => {
  // Récupération de l'utilisateur depuis Redux
  const auth = useSelector((state) => state.auth);
  const customerAccountId = auth?.user?.id_cust_account;
  const customerLoginId = auth?.user?.id_login_user;

  // Query params (optionnel, si vous en avez besoin)
  const params = new URLSearchParams(location.search);
  const existingOrderId = params.get('orderId');
  const existingCertifId = params.get('certifId');

  // Gestion des étapes
  const [currentStep, setCurrentStep] = useState(1);

  // state global du formulaire
  const [formData, setFormData] = useState({
    orderId: existingOrderId || null,
    certifId: existingCertifId || null,
    orderName: '',
    merchandises: [],
    remarks: '',
    transportModes: {
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

  // Debug : surveille les changements de formData
  useEffect(() => {
    console.log('formData updated:', formData);
  }, [formData]);

  // Fonctions de navigation
  const nextStep = () => {
    setCurrentStep((prev) => (prev < 4 ? prev + 1 : prev));
  };
  const prevStep = () => {
    setCurrentStep((prev) => (prev > 1 ? prev - 1 : prev));
  };

  // Handlers génériques
  const handleChange = (field, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };
  const handleMerchandiseChange = (newMerchandise) => {
    setFormData((prevState) => ({
      ...prevState,
      merchandises: [...prevState.merchandises, newMerchandise],
    }));
  };

  // Soumission finale (exemple)
  const handleSubmit = () => {
    console.log('Order Submitted:', formData);
    generatePDF(formData);
  };

  // Création de la commande (étape 1)
  const createEmptyOrder = async () => {
    try {
      const { orderName } = formData; 
      const response = await createOrder(orderName, customerAccountId, customerLoginId);
      const { newOrderId } = response;

      if (newOrderId) {
        // On stocke l'ID créé
        setFormData((prev) => ({ ...prev, orderId: newOrderId }));
        nextStep();
      } else {
        console.error('Order creation failed: No orderId returned');
      }
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  // Rendu conditionnel du contenu de chaque étape
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1
            nextStep={createEmptyOrder}
            handleChange={handleChange}
            values={formData}
          />
        );
      case 2:
        return (
          <Step2
            nextStep={nextStep}
            handleMerchandiseChange={handleMerchandiseChange}
            handleChange={handleChange}
            values={formData}
          />
        );
      case 3:
        // Correspond à votre composant Step4.jsx, nommé "Étape 3 : Pièces justificatives"
        return (
          <Step4
            nextStep={nextStep}
            prevStep={prevStep}
            handleChange={handleChange}
            values={formData}
          />
        );
      case 4:
        // Correspond à Step5.jsx, "Étape 4 : Récapitulatif"
        return (
          <Step5
            prevStep={prevStep}
            values={formData}
            handleSubmit={handleSubmit}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="create-order-container">
      {/* FRISE D'ÉTAPES : on a 4 étapes au total */}
      <nav className="steps-progress-nav">
        <ul className="steps-nav-list">
          {[1, 2, 3, 4].map((step) => {
            // On détermine si c'est l'étape active
            const isActive = currentStep === step;

            return (
              <li key={step} className={`step-tab ${isActive ? 'active' : ''}`}>
                {step === 1 && (
                  <>
                    <div className="step-tab-title">Étape 1</div>
                    <div className="step-tab-subtitle">Création de la commande</div>
                  </>
                )}
                {step === 2 && (
                  <>
                    <div className="step-tab-title">Étape 2</div>
                    <div className="step-tab-subtitle">Contenu du certificat d'origine</div>
                  </>
                )}
                {step === 3 && (
                  <>
                    <div className="step-tab-title">Étape 3</div>
                    <div className="step-tab-subtitle">Pièces justificatives</div>
                  </>
                )}
                {step === 4 && (
                  <>
                    <div className="step-tab-title">Étape 4</div>
                    <div className="step-tab-subtitle">Récapitulatif</div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Contenu de l'étape */}
      <div className="step-content">{renderStep()}</div>
    </div>
  );
};

export default CreateOrder;
