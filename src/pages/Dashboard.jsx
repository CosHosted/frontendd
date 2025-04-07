import { Box, Typography, Grid, Paper } from '@mui/material';
import './Dashboard'
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QRGenerator from '../components/teacher/QRGenerator';
import QRScanner from './components/student/QRScanner';
import AttendanceHistory from '../components/student/AttendanceHistory';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Xin chào, {user?.name}
      </Typography>

      <Grid container spacing={3}>
        {/* Component điểm danh dựa trên vai trò */}
        <Grid item xs={12} md={6}>
          {user?.role === 'teacher' ? (
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Tạo mã QR điểm danh
              </Typography>
              <QRGenerator />
            </Paper>
          ) : user?.role === 'student' ? (
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Quét mã QR để điểm danh
              </Typography>
              <QRScanner />
            </Paper>
          ) : null}
        </Grid>

        {/* Lịch sử điểm danh */}
        <Grid item xs={12}>
          <AttendanceHistory />
        </Grid>

        {/* Thông tin tài khoản */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Thông tin tài khoản
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography>
                <strong>Tên:</strong> {user?.name}
              </Typography>
              <Typography>
                <strong>Email:</strong> {user?.email}
              </Typography>
              <Typography>
                <strong>Vai trò:</strong>{' '}
                {user?.role === 'teacher'
                  ? 'Giáo viên'
                  : user?.role === 'student'
                  ? 'Sinh viên'
                  : 'Quản trị viên'}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 