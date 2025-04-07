import { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    IconButton,
    Button,
    CircularProgress,
    Alert,
    TablePagination
} from '@mui/material';
import { Schedule, Group } from '@mui/icons-material';
import * as classService from '../../services/classService';
import { useNavigate } from 'react-router-dom';

const ClassList = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const data = await classService.getTeacherClasses();
            console.log('Fetched teacher classes:', data); // Debug log
            setClasses(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching classes:', err); // Debug log
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleScheduleClick = (classId) => {
        console.log('Navigating to schedules for class:', classId); // Debug log
        navigate(`/teacher/classes/${classId}/schedules`);
    };

    const handleStudentsClick = (classId) => {
        navigate(`/teacher/classes/${classId}/students`);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    const paginatedClasses = classes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - classes.length) : 0;

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" component="h2">
                    Danh sách lớp học của tôi
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/teacher/classes/create')}
                >
                    Tạo lớp mới
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer>
                    <Table stickyHeader aria-label="sticky table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Tên lớp</TableCell>
                                <TableCell>Số sinh viên</TableCell>
                                <TableCell align="center">Thao tác</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedClasses.length === 0 && !loading ? (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">
                                        Chưa có lớp học nào hoặc không có lớp học trên trang này.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedClasses.map((classItem) => (
                                    <TableRow hover role="checkbox" tabIndex={-1} key={classItem.id}>
                                        <TableCell>{classItem.name}</TableCell>
                                        <TableCell>{classItem.Students?.length || 0}</TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                color="primary"
                                                onClick={() => handleScheduleClick(classItem.id)}
                                                title="Quản lý lịch học"
                                            >
                                                <Schedule />
                                            </IconButton>
                                            <IconButton
                                                color="primary"
                                                onClick={() => handleStudentsClick(classItem.id)}
                                                title="Quản lý sinh viên"
                                            >
                                                <Group />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                            {emptyRows > 0 && (
                                <TableRow style={{ height: 53 * emptyRows }}>
                                    <TableCell colSpan={3} />
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={classes.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Số lớp mỗi trang:"
                    labelDisplayedRows={({ from, to, count }) => 
                        `${from}-${to} trên ${count !== -1 ? count : `hơn ${to}`}`
                    }
                />
            </Paper>
        </Box>
    );
};

export default ClassList; 