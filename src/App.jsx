import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
  // Kiểm tra xem người dùng đã đăng nhập chưa
  const isAuthenticated = localStorage.getItem('token') !== null;
  const userRole = localStorage.getItem('userRole');

  // Hàm kiểm tra quyền truy cập
  const hasAccess = (allowedRoles) => {
    if (!isAuthenticated) return false;
    if (!allowedRoles) return true;
    return allowedRoles.includes(userRole);
  };

  // Hàm lấy đường dẫn dashboard dựa vào vai trò
  const getDashboardPath = () => {
    if (!isAuthenticated) return '/login';
    
    switch (userRole) {
      case 'admin':
        return '/admin/dashboard';
      case 'teacher':
        return '/teacher';
      case 'student':
        return '/student/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Route đăng nhập */}
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to={getDashboardPath()} /> : <Login />} 
          />
          
          {/* Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              hasAccess(['admin']) 
                ? <MainLayout><AdminDashboard /></MainLayout> 
                : <Navigate to="/login" />
            } 
          />
          
          {/* Teacher Routes */}
          <Route 
            path="/teacher" 
            element={
              hasAccess(['teacher']) 
                ? <MainLayout><TeacherDashboard /></MainLayout> 
                : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/teacher/classes" 
            element={
              hasAccess(['teacher']) 
                ? <MainLayout><ClassList /></MainLayout> 
                : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/teacher/classes/create" 
            element={
              hasAccess(['teacher']) 
                ? <MainLayout><CreateClass /></MainLayout> 
                : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/teacher/classes/:classId/schedules" 
            element={
              hasAccess(['teacher']) 
                ? <MainLayout><ClassSchedule /></MainLayout> 
                : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/teacher/classes/:classId/students" 
            element={
              hasAccess(['teacher']) 
                ? <MainLayout><ClassStudents /></MainLayout> 
                : <Navigate to="/login" />
            } 
          />
          
          {/* Student Routes */}
          <Route 
            path="/student/dashboard" 
            element={
              hasAccess(['student']) 
                ? <MainLayout><StudentDashboard /></MainLayout> 
                : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/student/check-in" 
            element={
              hasAccess(['student']) 
                ? <MainLayout><QrScanner /></MainLayout> 
                : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/student/attendance-history" 
            element={
              hasAccess(['student']) 
                ? <MainLayout><AttendanceHistory /></MainLayout> 
                : <Navigate to="/login" />
            } 
          />
          
          {/* Trang chủ và trang không tìm thấy */}
          <Route 
            path="/" 
            element={<Navigate to={getDashboardPath()} />} 
          />
          <Route 
            path="*" 
            element={<Navigate to={getDashboardPath()} />} 
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;