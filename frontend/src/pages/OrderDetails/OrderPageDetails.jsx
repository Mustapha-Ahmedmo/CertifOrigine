// OrderDetailsPage.jsx
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import './OrderDetailsPage.css'; // Create this CSS file for page-specific styles
import Step5 from '../../components/orders/Create/steps/Step5';
import { fetchCountries, getCertifGoodsInfo, getCertifTranspMode, getOrdersForCustomer, getTransmodeInfo } from '../../services/apiServices';
import { useSelector } from 'react-redux';

const OrderDetailsPage = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const orderId = params.get('orderId');
  const certifId = params.get('certifId');


  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);
  const idLogin = user?.id_login_user;
  const idCustAccount = user?.id_cust_account;

  const [transportModes, setTransportModes] = useState({});

  useEffect(() => {
    const fetchTransportModes = async () => {
      try {
        const fetchedTransportModes = await getTransmodeInfo(null, true);
        setTransportModes(fetchedTransportModes.data);
      } catch (error) {
        console.error("Error fetching transport modes:", error);
      }
    };
    fetchTransportModes();
  }, []);

  console.log(transportModes);

  // Declare all states at the top level
  const [formData, setFormData] = useState({
    orderId: orderId || null,
    certifId: certifId || null,
    orderName: '',
    merchandises: [],
    goodsOrigin: '',
    goodsDestination: '',
    transportModes: { air: false, mer: false, terre: false, mixte: false },
    transportRemarks: '',
    exporterName: 'INDIGO TRADING FZCO',
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
    receiverPhone: '',
    copies: '',
    remarks: '',
    isCommitted: false,
    documents: [], // Array for document details
  });

  const [countryMap, setCountryMap] = useState({});
  const [transpModes, setTranspModes] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // --- 1. Get Transport Mode Information ---
        // Use certifId (if available) and idCustAccount to fetch transport mode info.
        // If you have only one certificate ID, pass it directly.
        const transpResponse = await getCertifTranspMode({
          idListCT: null,                      // Not needed, or pass as null
          idListCO: certifId ? certifId.toString() : null, // Use the certificate id as string
          isActiveOT: 'true',
          isActiveTM: 'true',
          idListOrder: null,
          idCustAccount: idCustAccount ? idCustAccount.toString() : null,
          idListOrderStatus: null,
        });
        console.log("Transpmode =>", transpResponse);
        if (transpResponse && transpResponse.data) {
          // Suppose you want to mark all returned modes as selected.
          // (Or you might determine selection based on another piece of data.)
          const transportModesObj = {};
          transpResponse.data.forEach((mode) => {
            // Use a key like the symbol in lowercase (or any key you choose)
            transportModesObj[mode.symbol_fr.toLowerCase()] = true;
          });
          setFormData((prev) => ({
            ...prev,
            transportModes: transportModesObj,
          }));
        }

        // --- 2. Fetch Countries and Build Mapping ---
        const countriesResponse = await fetchCountries();
        const map = {};
        countriesResponse.forEach((country) => {
          map[country.id_country] = country.symbol_fr;
        });
        setCountryMap(map);

        // --- 3. Load Order Details ---
        if (orderId) {
          const ordersResponse = await getOrdersForCustomer({
            idCustAccountList: idCustAccount,
            idLogin: idLogin,
          });
          const orders = ordersResponse.data || ordersResponse;
          const order = orders.find((o) => o.id_order == orderId); // Using loose equality for type differences
          console.log("Order:", order);
          if (order) {
            setFormData((prev) => ({
              ...prev,
              orderStatus: order.id_order_status,
              // Map order title to orderLabel for synthesis
              orderLabel: order.order_title || '',
              merchandises: order.merchandises || [],
              // Use the local map to convert country IDs to symbol_fr
              goodsOrigin: order.id_country_origin || '',
              goodsDestination: order.id_country_destination || '',
              transportRemarks: order.transport_remarks || '',
              receiverName: order.recipient_name || 'N/A',
              receiverAddress: order.address_1 || 'N/A',
              receiverAddress2: order.address_2
                ? order.address_2 + (order.address_3 ? `, ${order.address_3}` : '')
                : '',
              receiverCity: order.city || 'N/A',
              receiverPostalCode: order.postal_code || 'N/A',
              receiverCountry: order.country || 'N/A',
              receiverPhone: order.receiver_phone || 'N/A',
              copies: order.copy_count_ori || 1,
              remarks: order.notes_ori || 'Aucune remarque',
              loadingPort: order.id_country_port_loading || '',
              dischargingPort: order.id_country_port_discharge || '',
            }));
          } else {
            console.error('Order not found for id:', orderId);
          }
        }

        if (certifId) {
          const goodsResponse = await getCertifGoodsInfo(certifId);
          console.log("Goods info response:", goodsResponse);
          // Map the returned goods data to the structure expected by Step5.
          // For example, we assume each good contains: goodDescription, goodReferences, quantity, unit.
          const mappedGoods = (goodsResponse.data || []).map((good) => ({
            id_ord_certif_goods: good.id_ord_certif_goods,  // add this property
            designation: good.good_description,
            boxReference: good.good_references,
            docReference: good.doc_references,
            quantity: good.weight_qty, // Ensure that your API returns quantity; otherwise, adjust
            unit: good.symbol_fr || 'N/A',
          }));
          setFormData((prev) => ({
            ...prev,
            merchandises: mappedGoods,
          }));
        }

      } catch (err) {
        console.error('Error loading order details:', err);
      }
    };

    loadData();
  }, [orderId, certifId, idCustAccount, idLogin]);

  // Handle the submit action from Step5 (e.g., generate PDF, submit data, etc.)
  const handleSubmit = () => {
    console.log('Submitting order details:', formData);

      navigate('/dashboard'); 
    // Insert your submission logic here (e.g., generatePDF(formData))
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="order-details-page">
      {/* Render the synthesis using the existing Step5 component */}
      <Step5
        prevStep={() => { }}
        values={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        isModal={false} // This is a full-page view, not a modal.
      />
    </div>
  );
};

export default OrderDetailsPage;