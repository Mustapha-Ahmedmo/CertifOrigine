import React, { useEffect, useState } from 'react';
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step4 from './steps/Step4'; // Étape 3
import Step5 from './steps/Step5'; // Étape 4

import './CreateOrder.css';
import { createOrder } from '../../../services/apiServices';
import { useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Slide from '@mui/material/Slide';
import Typography from '@mui/material/Typography';

// Import MUI / FontAwesome pour l'icône
import { useTheme, useMediaQuery } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faListCheck } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
// (Vous pouvez changer l'icône)

const CreateOrder = () => {
  // Récupération de l'utilisateur depuis Redux
  const auth = useSelector((state) => state.auth);
  const customerAccountId = auth?.user?.id_cust_account;
  const customerLoginId = auth?.user?.id_login_user;

  // Query params
  const params = new URLSearchParams(location.search);
  const existingOrderId = params.get('orderId');
  const existingCertifId = params.get('certifId');

  // Steps
  const [currentStep, setCurrentStep] = useState(1);
  const [transitionDirection, setTransitionDirection] = useState('left');

  // FormData global
  const [formData, setFormData] = useState({
    orderId: existingOrderId || null,
    orderStatus: 1,
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

  useEffect(() => {
    console.log('formData updated:', formData);
  }, [formData]);

  // Détection mobile
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Navigation
  const nextStep = () => {
    setTransitionDirection('left');
    setCurrentStep((prev) => (prev < 4 ? prev + 1 : prev));
  };
  const prevStep = () => {
    setTransitionDirection('right');
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
    // ...
  };

  // Création commande (étape 1)
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

  const navigate = useNavigate();

  // when we're done with Step4, go to the details page instead of Step5
  const goToOrderDetails = () => {
    const { orderId, certifId } = formData;
    navigate(
      `/dashboard/order-details?orderId=${orderId}&certifId=${certifId}`
    );
  };

  // Rendu conditionnel de chaque étape
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
            prevStep={prevStep}
            handleMerchandiseChange={handleMerchandiseChange}
            handleChange={handleChange}
            values={formData}
          />
        );
      case 3:
        return (
          <Step4
            nextStep={goToOrderDetails}
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

  // Liste des étapes
  const steps = [
    "Étape 1 : Création de la commande",
    "Étape 2 : Certificat d'origine ",
    "Étape 3 : Pièces justificatives",
    "Étape 4 : Récapitulatif",
  ];

  return (
    <div className="create-order-container">
      {/* Sur mobile, petite barre + icône, sinon Stepper complet */}
      {isSmallScreen ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            mb: 2
          }}
        >
          <FontAwesomeIcon icon={faListCheck} size="lg" style={{ color: '#DCAF26' }} />
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            {`${steps[currentStep - 1]}`}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ width: '100%', marginBottom: '20px' }}>
          <Stepper activeStep={currentStep - 1} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      )}

      <Slide
        key={currentStep}
        direction={transitionDirection}
        in={true}
        mountOnEnter
        unmountOnExit
      >
        <div className="step-content">
          {renderStep()}
        </div>
      </Slide>
    </div>
  );
};

export default CreateOrder;
