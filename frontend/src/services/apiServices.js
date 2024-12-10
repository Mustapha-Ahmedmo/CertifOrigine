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