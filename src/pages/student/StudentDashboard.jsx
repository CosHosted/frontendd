import React from 'react';
import { Container, Typography, Button, Box, Paper, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import HistoryIcon from '@mui/icons-material/History';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user')); // Lấy thông tin user

    return (
        <>
        <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ fontWeight: 700, color: 'primary.main', textAlign: 'center' }}
    >
        Trang Sinh Viên
    </Typography>
        <Container maxWidth="md" sx={{ mt: 4, mb: 4, display: 'flex', flexDirection: 'row' }}> 
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 2,
                    pr: 3,
                    borderRight: '1px solid lightgray',
                    minWidth: '200px'
                }}
            >
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<QrCodeScannerIcon />}
                    onClick={() => navigate('/student/check-in')}
                    sx={{
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        borderRadius: 2,
                        boxShadow: 3,
                        '&:hover': {
                            boxShadow: 4,
                            transform: 'translateY(-2px)'
                        }
                    }}
                >
                    Điểm Danh (Quét QR Ảnh)
                </Button>
                <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<HistoryIcon />}
                    onClick={() => navigate('/student/attendance-history')}
                    sx={{
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        borderRadius: 2,
                        borderWidth: 2,
                        '&:hover': {
                            borderWidth: 2,
                            boxShadow: 3,
                            transform: 'translateY(-2px)'
                        }
                    }}
                >
                    Xem Lịch Sử Điểm Danh
                </Button>
            </Box>

            <Box sx={{ flexGrow: 1, pl: 3 }}> 
           
                <Paper elevation={3} sx={{ p: 4, borderRadius: 3, boxShadow: 4 }}>
                    <Typography
                        variant="h5"
                        gutterBottom
                        sx={{ fontWeight: 700, color: 'primary.main', mb: 2, textAlign: 'center' }}
                    >
                        Thông tin sinh viên
                    </Typography>
                    <Avatar
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            width: 100,
                            height: 100,
                            margin: "0 auto",
                            mb: 2,
                            backgroundColor: 'primary.main',
                        }}
                    />
                    <Typography
                        variant="h6"
                        sx={{ mb: 4, textAlign: 'center', color: 'text.secondary' }}
                    >
                        Chào mừng, {user?.username || 'Sinh viên'} !<br />
                        {user?.studentId && `MSSV: ${user.studentId}`}<br /> 
                        {user?.email && `Email: ${user.email}`}<br />
                        {user?.role && `Vai trò: ${user.role}`}<br />
                       
                    </Typography>
                </Paper>
            </Box>
        </Container>
        </>
    );
};

export default StudentDashboard;
