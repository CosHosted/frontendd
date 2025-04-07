import React from 'react';
import { Container, Typography, Button, Box, Paper, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import HistoryIcon from '@mui/icons-material/History';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user')); // Lấy thông tin user

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Trang Sinh Viên
                </Typography>
                 <Typography variant="h6" sx={{ mb: 3 }}>
                    Chào mừng, {user?.username || 'Sinh viên'}! 
                    {user?.studentId && ` (MSSV: ${user.studentId})`}
                 </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<QrCodeScannerIcon />}
                            onClick={() => navigate('/student/check-in')} // Điều hướng đến trang quét QR
                            fullWidth
                            sx={{ py: 2 }}
                        >
                            Điểm Danh (Quét QR Ảnh)
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                         <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<HistoryIcon />}
                            onClick={() => navigate('/student/attendance-history')} // Đã có onClick
                            fullWidth
                            sx={{ py: 2 }}
                        >
                            Xem Lịch Sử Điểm Danh
                        </Button>
                    </Grid>
                    {/* Thêm các chức năng khác cho sinh viên ở đây nếu cần */}
                </Grid>
            </Paper>
        </Container>
    );
};

export default StudentDashboard;
