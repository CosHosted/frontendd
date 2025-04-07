import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Tooltip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import * as attendanceService from '../../services/attendanceService';

// Helper function to format date and time
const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    try {
        const date = new Date(isoString);
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    } catch (e) {
        console.error("Error formatting date:", e);
        return 'Invalid Date';
    }
};

// Helper to get day label (assuming dayOfWeek is 0-6, Sunday=0)
const DAYS_OF_WEEK_LABELS = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

const AttendanceHistory = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [studentInfo, setStudentInfo] = useState({ studentId: '', totalAttendance: 0 });

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await attendanceService.getAttendanceHistory();
            console.log("Fetched History:", data);
            setStudentInfo({
                studentId: data.studentId || 'N/A',
                totalAttendance: data.totalAttendance || 0,
            });
            setHistory(data.history || []);
        } catch (err) {
            console.error("Error fetching attendance history:", err);
            setError(err.message || 'Không thể tải lịch sử điểm danh.');
            setHistory([]);
            setStudentInfo({ studentId: '', totalAttendance: 0 });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return (
        <Box>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/student/dashboard')}
                sx={{ mb: 2 }}
            >
                Quay lại Dashboard
            </Button>

            <Typography variant="h5" component="h1" gutterBottom>
                Lịch Sử Điểm Danh
            </Typography>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                MSSV: {studentInfo.studentId} - Tổng số buổi đã điểm danh: {studentInfo.totalAttendance}
            </Typography>

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                    <CircularProgress />
                </Box>
            )}

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}

            {!loading && !error && (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Lớp học</TableCell>
                                <TableCell>Buổi học</TableCell>
                                <TableCell>Thời gian điểm danh</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {history.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">
                                        Chưa có lịch sử điểm danh nào.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                history.map((record, index) => (
                                    <TableRow key={index}> {/* Nên có key ổn định hơn nếu backend trả về ID */}
                                        <TableCell>{record.className || 'N/A'}</TableCell>
                                        <TableCell>
                                            {record.schedule ? (
                                                <Tooltip title={`Ngày ${record.date || 'N/A'}`}>
                                                     <span>
                                                        {DAYS_OF_WEEK_LABELS[record.schedule.dayOfWeek] || 'N/A'} ({record.schedule.time || 'N/A'})
                                                    </span>
                                                 </Tooltip>
                                            ) : 'N/A'}
                                        </TableCell>
                                        <TableCell>{formatDateTime(record.checkinTime)}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default AttendanceHistory; 