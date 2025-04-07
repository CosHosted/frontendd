const config = {
  API_URL: 'https://diemdanhserver.vercel.app/api',
  REFRESH_TOKEN_URL: 'http://localhost:5000/api/auth/refresh-token'
};
//Neu dung bien env
// const config = {
//     API_URL: window._env_?.REACT_APP_API_URL || 'http://localhost:5000/api',
//     REFRESH_TOKEN_URL: window._env_?.REACT_APP_REFRESH_TOKEN_URL || 'http://localhost:5000/api/auth/refresh-token'
// };
  

export default config; 
