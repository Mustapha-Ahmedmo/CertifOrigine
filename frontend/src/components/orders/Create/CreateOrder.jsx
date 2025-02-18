import React, { useEffect, useState } from 'react';
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step4 from './steps/Step4'; // Étape 3
import Step5 from './steps/Step5'; // Étape 4
import { generatePDF } from '../GeneratePDF';
import './CreateOrder.css';
import { createOrder } from '../../../services/apiServices';
import { useSelector } from 'react-redux';

// ------ IMPORTS MUI ------
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';

const CreateOrder = () => {
  // Récupération de l'utilisateur depuis Redux
  const auth = useSelector((state) => state.auth);
  const customerAccountId = auth?.user?.id_cust_account;
  const customerLoginId = auth?.user?.id_login_user;

  // Query params
  const params = new URLSearchParams(location.search);
  const existingOrderId = params.get('orderId');
  const existingCertifId = params.get('certifId');

  // Gestion des étapes (1→4)
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

  // Juste pour debug
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

  // Handlers
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const handleMerchandiseChange = (newMerchandise) => {
    setFormData((prev) => ({
      ...prev,
      merchandises: [...prev.merchandises, newMerchandise],
    }));
  };

  // Soumission finale
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
        return (
          <Step4
            nextStep={nextStep}
            prevStep={prevStep}
            handleChange={handleChange}
            values={formData}
          />
        );
      case 4:
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

  // ---- Définir le texte de nos 4 étapes ----
  const steps = [
    "Étape 1 : Création de la commande",
    "Étape 2 : Contenu du certificat d'origine",
    "Étape 3 : Pièces justificatives",
    "Étape 4 : Récapitulatif",
  ];

  return (
    <div className="create-order-container">
      {/* Material-UI Stepper */}
      <Box sx={{ width: '100%', marginBottom: '20px' }}>
        <Stepper activeStep={currentStep - 1} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Contenu de l'étape courante */}
      <div className="step-content">
        {renderStep()}
      </div>
    </div>
  );
};

export default CreateOrder;
