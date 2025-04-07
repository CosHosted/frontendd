import axios from 'axios';
import config from '../config/config';

const api = axios.create({
  baseURL: 'https://diemdanhserver.vercel.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response);
    return response;
  },
  async (error) => {
    console.error('API Response Error:', error);
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const token = localStorage.getItem('refreshToken');
        const response = await axios.post(config.REFRESH_TOKEN_URL, { token });
        
        const newToken = response.data.token;
        localStorage.setItem('token', newToken);
        
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Kiểm tra role để chuyển hướng về đúng trang đăng nhập
        const userRole = localStorage.getItem('userRole');
        localStorage.clear();
        
        if (userRole === 'student') {
          window.location.href = '/auth/student/login';
        } else {
          window.location.href = '/auth/teacher/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Xử lý các lỗi khác
    const errorMessage = error.response?.data?.error || 'Đã có lỗi xảy ra';
    return Promise.reject(new Error(errorMessage));
  }
);

export default api;
