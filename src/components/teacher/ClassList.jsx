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
    CircularProgress,
    Alert,
    TablePagination,
    Tooltip
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
            setClasses(data);
            setError(null);
        } catch (err) {
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
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Paper
                sx={{
                    width: '100%',
                    overflow: 'hidden',
                    p: 2,
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', // Thêm shadow
                    borderRadius: '10px'
                }}
            >
                <TableContainer
                    sx={{
                        border: '2px solid #e0e0e0',
                        borderRadius: '10px',
                        mt: 2,
                        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)' // Thêm shadow
                    }}
                >
                    <Table stickyHeader aria-label="sticky table">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                                    Tên lớp
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                                    Số sinh viên
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                                    Thao tác
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedClasses.length === 0 && !loading ? (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">
                                        <Typography color="text.secondary">
                                            Chưa có lớp học nào hoặc không có lớp học trên trang này.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedClasses.map((classItem, index) => (
                                    <TableRow
                                        hover
                                        role="checkbox"
                                        tabIndex={-1}
                                        key={classItem.id}
                                        sx={{
                                            backgroundColor: index % 2 === 0 ? '#fafafa' : 'inherit'
                                        }}
                                    >
                                        <TableCell>{classItem.name}</TableCell>
                                        <TableCell>{classItem.Students?.length || 0}</TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Quản lý lịch học">
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleScheduleClick(classItem.id)}
                                                >
                                                    <Schedule />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Quản lý sinh viên">
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleStudentsClick(classItem.id)}
                                                >
                                                    <Group />
                                                </IconButton>
                                            </Tooltip>
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
                    sx={{ mt: 2 }}
                />
            </Paper>
        </Box>
    );
};

export default ClassList;