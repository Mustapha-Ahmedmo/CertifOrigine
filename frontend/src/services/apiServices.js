// src/services/apiService.js

const API_URL = import.meta.env.VITE_API_URL;

export const loginUser = async (username, password) => {
  console.log('API URL:', API_URL);
/*  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }*/
};

// You can add more functions for signup, fetching data, etc.