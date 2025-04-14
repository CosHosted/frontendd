import axios from 'axios';

// Use the Railway URL for production, localhost for development
const API_URL = 'http://localhost:5000/api';
// const API_URL = 'http://localhost:5000/api'; // Uncomment for local development

console.log('API URL being used:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  // Add timeout to prevent hanging requests
  timeout: 10000
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Response: ${response.status} from ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with an error
      console.error(`❌ Response Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      // Request was made but no response
      console.error('❌ No response received:', error.request);
    } else {
      // Error in setting up the request
      console.error('❌ Request setup error:', error.message);
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 