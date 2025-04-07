import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuth = (allowedRoles) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user || !user.role) {
      navigate('/auth/student/login');
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      if (user.role === 'student') {
        navigate('/student');
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/teacher');
      }
    }
  }, [navigate, allowedRoles]);
}; 