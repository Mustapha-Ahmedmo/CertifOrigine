import React, { useEffect, useState } from 'react';
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step3 from './steps/Step3';
import Step4 from './steps/Step4';
import Step5 from './steps/Step5';
import { generatePDF } from '../GeneratePDF';
import './CreateOrder.css';
import { createOrder } from '../../../services/apiServices';
import { useSelector } from 'react-redux';

const CreateOrder = () => {

  const auth = useSelector((state) => state.auth); // Access user data from Redux
  const customerAccountId = auth?.user?.id_cust_account; // Customer Account ID from the logged-in user
  const customerLoginId = auth?.user?.id_login_user;

  const params = new URLSearchParams(location.search);
  const existingOrderId = params.get('orderId');
  const existingCertifId = params.get('certifId');

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    orderId: existingOrderId || null,
    certifId: existingCertifId || null,
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
    const loadExistingData = async () => {
      try {
        if (existingOrderId) {
          // 1. Fetch the order from the server
          const order = await getOrderById(existingOrderId);
          // Populate formData with order info
          setFormData((prev) => ({
            ...prev,
            orderId: existingOrderId,
            orderName: order.orderTitle || '',
          }));
        }
  
        if (existingCertifId) {
          // 2. Fetch the certificate from the server
          const cert = await getCertificateById(existingCertifId);
          // Populate formData with certificate info
          setFormData((prev) => ({
            ...prev,
            certifId: existingCertifId,
            merchandises: cert.merchandises || [],
            goodsOrigin: cert.goodsOrigin || '',
            goodsDestination: cert.goodsDestination || '',
            // etc...
          }));
        }
      } catch (err) {
        console.error('Error loading existing order/cert data:', err);
      }
    };
  
    loadExistingData();
  }, [existingOrderId, existingCertifId]);

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

  const createEmptyOrder = async () => {
    try {
      const { orderName } = formData; // Extract the order name from formData

      const response = await createOrder(orderName, customerAccountId, customerLoginId); // Provide necessary IDs like customer and login IDs
      const { newOrderId } = response; // Extract the newly created orderId from the response

      if (newOrderId) {
        setFormData((prevState) => ({
          ...prevState,
          orderId: newOrderId, // Store the orderId for subsequent steps
        }));
        nextStep(); // Proceed to the next step
      } else {
        console.error('Order creation failed: No orderId returned');
      }
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1
            nextStep={createEmptyOrder} // Use createEmptyOrder for Step 1 submission
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
          />);

      case 3:
        return (
          <Step4 nextStep={nextStep} prevStep={prevStep} handleChange={handleChange} values={formData} />
        );
      case 4:
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
        {[1, 2,].map((step) => (
          <div key={step} className={`step-item ${currentStep >= step ? 'completed' : ''}`}>
            <div className="step-circle">{currentStep > step ? '✔️' : step}</div>
            <div className="step-label">
              {step === 1 && 'ÉTAPE1\nCRÉATION D\'UNE COMMANDE'}
              {step === 2 && 'ÉTAPE2\nPIECE JUSTIFICATIVE'}
              {step === 3 && 'ÉTAPE3\nNOMBRE DE COPIE CERTIFIÉ'}
            </div>
          </div>
        ))}
      </div>
      <div className="step-content">{renderStep()}</div>
    </div>
  );
};

export default CreateOrder;