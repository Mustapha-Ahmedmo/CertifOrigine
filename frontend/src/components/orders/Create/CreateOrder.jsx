import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Slide,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { faListCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step4 from './steps/Step4';
import Step5 from './steps/Step5';

import { createOrder } from '../../../services/apiServices';
import './CreateOrder.css';

const steps = [
  'Étape 1 : Création de la commande',
  "Étape 2 : Certificat d'origine",
  'Étape 3 : Pièces justificatives',
  'Étape 4 : Récapitulatif',
];

const CreateOrder = () => {
  const auth = useSelector((s) => s.auth);
  const customerAccountId = auth.user?.id_cust_account;
  const customerLoginId  = auth.user?.id_login_user;

  const location = useLocation();
  const navigate = useNavigate();
  const params   = new URLSearchParams(location.search);
  const existingOrderId  = params.get('orderId');
  const existingCertifId = params.get('certifId');

  // decide initial step:
  // if there's already a certif, go straight to recap (step 4)
  // else if there's already an order, start at step 2
  // otherwise start at step 1
  const computeInitialStep = () => {
    if (existingCertifId) return 4;
    if (existingOrderId) return 2;
    return 1;
  };

  const [currentStep, setCurrentStep] = useState(computeInitialStep());
  const [transitionDirection, setTransitionDirection] = useState('left');

  const [formData, setFormData] = useState({
    orderId:        existingOrderId,
    certifId:       existingCertifId,
    orderStatus:    1,
    orderName:      '',
    merchandises:   [],
    remarks:        '',
    transportModes: { air: false, mer: false, terre: false },
    isPaperCopy:    false,
    isTemplate:     false,
    exporterName:   '',
    exporterCompany2: '',
    exporterAddress: '',
    exporterAddress2: '',
    exporterPostalCode: '',
    exporterCity:    '',
    exporterCountry: '',
    receiverName:    '',
    receiverCompany2:'',
    receiverAddress: '',
    receiverAddress2:'',
    receiverPostalCode:'',
    receiverCity:     '',
    receiverCountry:  '',
  });

  // keep formData in sync with URL params if user manually changes them
  useEffect(() => {
    setFormData((f) => ({
      ...f,
      orderId:  existingOrderId,
      certifId: existingCertifId,
    }));
  }, [existingOrderId, existingCertifId]);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const nextStep = () => {
    setTransitionDirection('left');
    setCurrentStep((s) => Math.min(s + 1, 4));
  };
  const prevStep = () => {
    setTransitionDirection('right');
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  const handleChange = (field, value) => {
    setFormData((f) => ({ ...f, [field]: value }));
  };
  const handleMerchandiseChange = (m) => {
    setFormData((f) => ({ ...f, merchandises: [...f.merchandises, m] }));
  };

  // create a brand-new order, then advance
  const createEmptyOrder = async () => {
    try {
      const { orderName } = formData;
      const { newOrderId } = await createOrder(orderName, customerAccountId, customerLoginId);
      if (newOrderId) {
        setFormData((f) => ({ ...f, orderId: newOrderId }));
        nextStep();
      } else {
        console.error('No orderId returned');
      }
    } catch (err) {
      console.error('Error creating order:', err);
    }
  };

  // when docs step finishes, jump to details instead of step5
  const goToOrderDetails = () => {
    const { orderId, certifId } = formData;
    navigate(`/order-details?orderId=${orderId}&certifId=${certifId}`);
  };

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
            handleSubmit={() => console.log('final submit', formData)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="create-order-container">
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
            {steps[currentStep - 1]}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ width: '100%', mb: 2 }}>
          <Stepper
            activeStep={currentStep - 1}
            alternativeLabel
            sx={{
              // Pastille de l'étape active
              '& .MuiStepIcon-root.Mui-active': {
                color: '#DCAF26',
              },
              // (Optionnel) Texte du label de l'étape active
              '& .MuiStepLabel-label.Mui-active': {
                color: '#DCAF26 !important',
              },

            }}
          >
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
        in
        mountOnEnter
        unmountOnExit
      >
        <div className="step-content">{renderStep()}</div>
      </Slide>
    </div>
  );
};

export default CreateOrder;