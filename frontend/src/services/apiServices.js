// src/services/apiService.js

const API_URL = import.meta.env.VITE_API_URL;

export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

export const fetchSectors = async (idList = null) => {
  try {
    const url = idList
      ? `${API_URL}/sectors?id_list=${idList}`
      : `${API_URL}/sectors`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Fetching sectors failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

export const fetchCountries = async (idList = null) => {
  try {
    const url = idList
      ? `${API_URL}/countries?id_list=${idList}`
      : `${API_URL}/countries`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Fetching countries failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

export const setCustAccount = async (accountData) => {
  try {
    const response = await fetch(`${API_URL}/customer/setCustAccount`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accountData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Setting customer account failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};


export const setCustUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/customer/setCustUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Setting customer user failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }), // Use email instead of username
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

export const updateCustAccountStatus = async (id) => {
  try {
    const response = await fetch(`${API_URL}/customer/update-status/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Inclure le token JWT si nécessaire
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Mise à jour du statut échouée.');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut du compte client:', error);
    throw error;
  }
};

export const getCustAccountInfo = async (idList = null, statutflag = null, isactive = null) => {
  try {
    // Construire l'URL avec les paramètres de query
    const params = new URLSearchParams();
    if (idList) params.append('id_list', idList);
    if (statutflag !== null) params.append('statutflag', statutflag);
    if (isactive !== null) params.append('isactive', isactive);

    const response = await fetch(`${API_URL}/customer/getCustAccountinfo?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assurez-vous que le token est stocké dans localStorage
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Fetching customer account info failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

export const rejectCustAccount = async (id, reason, idlogin) => {
  try {
    const response = await fetch(`${API_URL}/customer/rejectCustAccount/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include JWT token if needed
      },
      body: JSON.stringify({ reason, idlogin }), // Include reason and operator ID
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Rejection of customer account failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error during customer account rejection:', error);
    throw error;
  }
};

export const addSubscription = async (subscriptionData) => {
  try {
    const response = await fetch(`${API_URL}/customer/add-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include if authenticated
      },
      body: JSON.stringify(subscriptionData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Inscription échouée');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    throw error;
  }
};

export const addSubscriptionWithFile = async (subscriptionData) => {
  try {
    const formData = new FormData();

    // Append all fields to the FormData object
    for (const key in subscriptionData) {
      if (subscriptionData.hasOwnProperty(key)) {
        if (
          key === 'licenseFile' ||
          key === 'patenteFile' ||
          key === 'rchFile'
        ) {
          if (subscriptionData[key]) {
            formData.append(key, subscriptionData[key]);
          }
        } else {
          formData.append(key, subscriptionData[key]);
        }
      }
    }

    const response = await fetch(`${API_URL}/customer/add-subscription-with-file`, {
      method: 'POST',
      headers: {
        // 'Content-Type': 'multipart/form-data', // Do NOT set Content-Type manually when using FormData
        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include JWT token if required
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Adding subscription with file failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding subscription with file:', error);
    throw error;
  }
};

export const requestPasswordReset = async (data) => {
  try {
    const response = await fetch(`${API_URL}/customer/password-reset/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data), // Expected format: { email: 'user@example.com' }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to request password reset');
    }

    return await response.json(); // Expected response: { message: 'Password reset link sent.' }
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

export const resetPassword = async (data) => {
  try {
    const response = await fetch(`${API_URL}/customer/password-reset/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data), // Expected format: { token: 'reset-token', newPassword: 'NewPass123' }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to reset password');
    }

    return await response.json(); // Expected response: { message: 'Password reset successful.' }
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

export const getOperatorList = async (idList = null, roleList = null, isActive = null) => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (idList) params.append('id_list', idList); // Add ID list to query params
    if (roleList) params.append('role_list', roleList); // Add Role list to query params
    if (isActive !== null) params.append('isActive', isActive); // Convert to string and add isActive

    // Perform API request
    const response = await fetch(`${API_URL}/operators/list?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include JWT token if required
      },
    });

    // Check if response is okay
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch operator list');
    }

    // Return response JSON
    return await response.json();
  } catch (error) {
    console.error('API call error (getOperatorList):', error);
    throw error;
  }
};

export const createOperator = async (operatorData) => {
  try {
    const response = await fetch(`${API_URL}/operators/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include JWT token if required
      },
      body: JSON.stringify(operatorData), // Pass the operator data as the request body
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create operator');
    }

    return await response.json();
  } catch (error) {
    console.error('API call error (createOperator):', error);
    throw error;
  }
};

export const disableOperator = async (operatorId) => {
  try {
    const response = await fetch(`${API_URL}/operators/disable/${operatorId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include JWT token if required
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to disable operator');
    }

    return await response.json();
  } catch (error) {
    console.error('API call error (disableOperator):', error);
    throw error;
  }
};
export const getCustUsersByAccount = async (custAccountId, statutflag = null, isactiveCA = 'true', isactiveCU = 'true', ismain_user = 'true') => {
  try {
    const params = new URLSearchParams();
    params.append('custAccountId', custAccountId);
    if (statutflag !== null) params.append('statutflag', statutflag);
    params.append('isactiveCA', isactiveCA);
    params.append('isactiveCU', isactiveCU);
    params.append('ismain_user', ismain_user);
    
    const response = await fetch(`${API_URL}/customer/get-cust-users?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch cust users');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call error (getCustUsersByAccount):', error);
    throw error;
  }
};

export const deleteCustUser = async (id) => {
  try {
    const response = await fetch(`${API_URL}/customer/delete-cust-user/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include token if needed
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to deactivate customer user');
    }

    return await response.json();
  } catch (error) {
    console.error('API call error (deleteCustUser):', error);
    throw error;
  }
};

export const createOrder = async (orderTitle, idCustAccount, idloginInsert) => {
  try {
    const response = await fetch(`${API_URL}/orders/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include token if needed
      },
      body: JSON.stringify({
        orderTitle,
        idCustAccount,
        idloginInsert,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create order');
    }

    return await response.json();
  } catch (error) {
    console.error('API call error (createOrder):', error);
    throw error;
  }
};

export const getTransmodeInfo = async (idList = null, isActive = null) => {
  try {
    const params = new URLSearchParams();
    if (idList) params.append('id_list', idList); // Add ID list to query params
    if (isActive !== null) params.append('isActive', isActive); // Convert to string and add isActive

    const response = await fetch(`${API_URL}/orders/transport-modes?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include JWT token if required
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch transport mode information');
    }

    return await response.json();
  } catch (error) {
    console.error('API call error (getTransmodeInfo):', error);
    throw error;
  }
};

export const getUnitWeightInfo = async (idList = null, isActive = null) => {
  try {
    const params = new URLSearchParams();
    if (idList) params.append('id_list', idList); // Add ID list to query params
    if (isActive !== null) params.append('isActive', isActive); // Convert to string and add isActive

    const response = await fetch(`${API_URL}/orders/unit-weights?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include JWT token if required
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch unit weight information');
    }

    return await response.json();
  } catch (error) {
    console.error('API call error (getUnitWeightInfo):', error);
    throw error;
  }
};

export const fetchRecipients = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);

    const response = await fetch(`${API_URL}/orders/recipients?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch recipients');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching recipients:', error);
  }
};

export const addRecipient = async (recipientData) => {
  try {
    const response = await fetch(`${API_URL}/orders/recipients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(recipientData),
    });

    if (!response.ok) {
      throw new Error('Failed to add or update recipient');
    }

    const data = await response.json();
    console.log(data.message); // Success message
    return data;
  } catch (error) {
    console.error('Error adding recipient:', error);
  }
};

export const createCertificate = async (certData) => {
  try {
    const response = await fetch(`${API_URL}/orders/create-certif`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(certData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create certificate');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating certificate:', error);
    throw error;
  }
};

export const addOrUpdateGoods = async (goodsData) => {
  try {
    const response = await fetch(`${API_URL}/orders/certif-goods`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(goodsData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add or update goods');
    }

    const data = await response.json();
    console.log('Goods added/updated successfully:', data);

    return data; // Return the API response, including the new ID
  } catch (error) {
    console.error('Error adding/updating goods:', error);
    throw error; // Ensure the caller can handle errors properly
  }
};
export const getOrdersForCustomer = async ({ idOrderList = null, idCustAccountList = null, idOrderStatusList = null, idLogin }) => {
  try {
    if (!idLogin) {
      throw new Error('Le champ idLogin est requis.');
    }

    const params = new URLSearchParams();
    if (idOrderList) params.append('idOrderList', idOrderList);
    if (idCustAccountList) params.append('idCustAccountList', idCustAccountList);
    if (idOrderStatusList) params.append('idOrderStatusList', idOrderStatusList);
    params.append('idLogin', idLogin);

    const response = await fetch(`${API_URL}/orders/customer-orders?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include JWT token if required
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch orders');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching orders for customer:', error);
    throw error;
  }
};

export const getCertifGoodsInfo = async (idOrdCertifOri) => {
  try {
    const response = await fetch(`${API_URL}/orders/certif-goods?idOrdCertifOri=${idOrdCertifOri}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch certification goods data.');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching certification goods info:', error);
    throw error;
  }
};