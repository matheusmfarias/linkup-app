import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.118.163:3000/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
