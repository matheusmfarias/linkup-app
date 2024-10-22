import axios from 'axios';

const API_URL = 'http://192.168.118.163:3000/api/auth'; // Verifique se esta URL está correta

const register = async (email, password, firstName, lastName) => {
  try {
    const response = await axios.post(`${API_URL}/register`, { email, password, firstName, lastName });
    return response.data;
  } catch (error) {
    console.error('Error during registration:', error.response?.data || error.message);
    throw new Error('Registration failed');
  }
};

const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
  } catch (error) {
    console.error('Error during login:', error.response?.data || error.message);
    throw new Error('Login failed');
  }
};

export default {
  register,
  login,
};
