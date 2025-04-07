import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import ClassList from './components/teacher/ClassList';
import CreateClass from './components/teacher/CreateClass';
import ClassSchedule from './components/teacher/ClassSchedule';
import ClassStudents from './components/teacher/ClassStudents';
import QrScanner from './components/student/QRScanner';
import AttendanceHistory from './components/student/AttendanceHistory';
import CssBaseline from '@mui/material/CssBaseline';
import '@fontsource/montserrat/300.css';
import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/700.css';

const theme = createTheme({
  typography: {
    fontFamily: 'Montserrat, sans-serif',
  },
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const App = () => {
  // Lấy thông tin từ localStorage một lần ở đây
  const storedToken = localStorage.getItem('token');
  const storedUserString = localStorage.getItem('user');
  let user = null;
  try {
      if (storedUserString) {
          user = JSON.parse(storedUserString); 
      }
  } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      // Có thể xóa localStorage bị lỗi nếu cần
      // localStorage.removeItem('user');
      // localStorage.removeItem('token');
  }

  // Lấy vai trò từ object user đã parse (nếu user tồn tại)
  const userRole = user ? user.role : null;

  const getDashboardPath = () => {
    // Hàm này giữ nguyên, sử dụng userRole đã lấy ở trên
    switch (userRole) {
      case 'admin':
        return '/admin/dashboard';
      case 'teacher':
        return '/teacher'; // Có thể là /teacher/dashboard tùy cấu trúc
      case 'student':
        return '/student/dashboard';
      default:
        return '/login';
    }
  };

  const ProtectedRoute = ({ children, allowedRoles }) => {
    // Sử dụng biến user và storedToken đã lấy ở ngoài
    if (!user || !storedToken) { // Kiểm tra cả user sau parse và token
      console.log("[ProtectedRoute] No user or token, redirecting to login.");
      return <Navigate to="/login" replace />;
    }
    
    // Lấy vai trò từ user object đã được parse một cách an toàn
    const currentUserRole = user.role; 
    
    // Log để debug
    console.log(`[ProtectedRoute] User role: ${currentUserRole}, Allowed roles: ${allowedRoles}`);

    // Kiểm tra vai trò dựa trên user.role
    if (allowedRoles && !allowedRoles.includes(currentUserRole)) { 
        console.log(`[ProtectedRoute] Role mismatch (${currentUserRole} not in ${allowedRoles}), redirecting.`);
        return <Navigate to={getDashboardPath()} replace />;
    }
    
    // Nếu mọi thứ OK, render children hoặc Outlet
    console.log("[ProtectedRoute] Access granted.");
    return children ? children : <Outlet />; 
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router future={{ v7_startTransition: true }}>
        <Routes>
          <Route 
            path="/login" 
            // Sử dụng user và storedToken đã lấy ở ngoài
            element={!user || !storedToken ? <Login /> : <Navigate to={getDashboardPath()} replace />} 
          />
          
          {/* === RESTRUCTURED PROTECTED ROUTES === */}
          <Route 
            element={ 
              <ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}> 
                {/* MainLayout bây giờ bao bọc Outlet của ProtectedRoute */} 
                <MainLayout /> 
              </ProtectedRoute> 
            }
          >
              {/* Các route con sẽ được render vào Outlet của MainLayout */}
              
              {/* Admin Route */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} /> 

              {/* Teacher Routes */}
              {/* Route gốc /teacher render TeacherDashboard */}
              <Route path="/teacher" element={<TeacherDashboard />} /> 
              {/* Các route con của teacher không cần /teacher tiền tố nữa nếu lồng vào */}
              {/* Hoặc giữ nguyên cấu trúc cũ nếu TeacherDashboard có Outlet riêng */} 
              {/* Cách đơn giản hơn là không lồng Teacher routes vào đây nếu không cần */}
               <Route path="/teacher/classes" element={<ClassList />} /> 
               <Route path="/teacher/classes/create" element={<CreateClass />} />
               <Route path="/teacher/classes/:classId/schedules" element={<ClassSchedule />} />
               <Route path="/teacher/classes/:classId/students" element={<ClassStudents />} />
               
              {/* Student Routes */}
              {/* Route gốc /student/dashboard render StudentDashboard */}
              <Route path="/student/dashboard" element={<StudentDashboard />} /> 
              {/* Các route con của student */}
              <Route path="/student/check-in" element={<QrScanner />} /> 
              <Route path="/student/attendance-history" element={<AttendanceHistory />} /> 
              
              {/* Có thể cần một route index mặc định cho layout này */}
              {/* Ví dụ: chuyển hướng từ / về dashboard tương ứng */}
              {/* <Route index element={<Navigate to={getDashboardPath()} replace />} /> */}

          </Route>
          {/* === END RESTRUCTURED PROTECTED ROUTES === */}

          {/* Route mặc định đã xử lý chuyển hướng ở trên */}
          <Route 
            path="/" 
            element={<Navigate to={getDashboardPath()} replace />} 
          />
          {/* Route fallback */}
          <Route
            path="*"
            element={<Navigate to={getDashboardPath()} replace />} // Hoặc trang 404
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;