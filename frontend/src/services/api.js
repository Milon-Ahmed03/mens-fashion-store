// Backend-এর সাথে কথা বলার Axios সেটআপ
import axios from 'axios';

const api = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api' });

// প্রতিটি রিকোয়েস্টে JWT পাঠায়
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Session শেষ বা Account Block হলে অটো লগআউট
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const { response, config } = error;
    const isAuthCall = config && config.url && config.url.includes('/auth/');
    const blocked = response && response.status === 403 && /blocked/i.test(response.data?.message || '');
    if (localStorage.getItem('token') && !isAuthCall && response && (response.status === 401 || blocked)) {
      window.dispatchEvent(new Event('auth-expired'));
    }
    return Promise.reject(error);
  }
);

// Error থেকে দেখানোর মতো বার্তা বের করে
export const errMsg = (e) => e?.response?.data?.message || e?.message || 'Something went wrong';

export default api;
