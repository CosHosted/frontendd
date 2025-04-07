import { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Paper,
    Alert,
    CircularProgress
} from '@mui/material';
import { createUser } from '../../services/adminService';

const CreateUser = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'student',
        email: '',
        studentId: '',
        name: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Tự động cập nhật studentId khi username thay đổi nếu role là student
    useEffect(() => {
        if (formData.role === 'student') {
            setFormData(prev => ({
                ...prev,
                studentId: prev.username
            }));
        }
    }, [formData.username, formData.role]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await createUser(formData);
            setSuccess(true);
            setFormData({
                username: '',
                password: '',
                role: 'student',
                email: '',
                studentId: '',
                name: ''
            });
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
                Tạo người dùng mới
            </Typography>

            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    Tạo người dùng thành công!
                </Alert>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <form onSubmit={handleSubmit}>
                <FormControl fullWidth margin="normal">
                    <InputLabel>Vai trò</InputLabel>
                    <Select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        label="Vai trò"
                        required
                    >
                        <MenuItem value="student">Sinh viên</MenuItem>
                        <MenuItem value="teacher">Giáo viên</MenuItem>
                        <MenuItem value="admin">Quản trị viên</MenuItem>
                    </Select>
                </FormControl>

                {formData.role === 'student' ? (
                    <>
                        <TextField
                            fullWidth
                            label="Mã số sinh viên / Tên đăng nhập"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            margin="normal"
                            required
                            helperText="Mã số sinh viên sẽ được sử dụng làm tên đăng nhập"
                        />
                        <TextField
                            fullWidth
                            label="Xác nhận mã số sinh viên"
                            value={formData.studentId}
                            margin="normal"
                            disabled
                            sx={{ bgcolor: 'action.hover' }}
                        />
                        <TextField
                            fullWidth
                            label="Họ và tên"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            margin="normal"
                            required
                        />
                    </>
                ) : (
                    <TextField
                        fullWidth
                        label="Tên đăng nhập"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        margin="normal"
                        required
                    />
                )}

                <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    margin="normal"
                />

                <TextField
                    fullWidth
                    label="Mật khẩu"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    margin="normal"
                    required
                />

                <Box sx={{ mt: 3 }}>
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={loading}
                        sx={{ height: 48 }}
                    >
                        {loading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Tạo người dùng'
                        )}
                    </Button>
                </Box>
            </form>
        </Paper>
    );
};

export default CreateUser; 