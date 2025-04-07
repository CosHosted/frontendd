import { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Alert,
    CircularProgress
} from '@mui/material';
import * as classService from '../../services/classService';
import { useNavigate } from 'react-router-dom';

const CreateClass = () => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await classService.createClass({ name });
            setSuccess(true);
            setName('');
            // Chờ 1 giây để hiển thị thông báo thành công trước khi chuyển trang
            setTimeout(() => {
                navigate('/teacher/classes');
            }, 1000);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h5" component="h2" gutterBottom>
                Tạo lớp học mới
            </Typography>

            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    Tạo lớp học thành công!
                </Alert>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    label="Tên lớp học"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    margin="normal"
                    required
                    helperText="Ví dụ: Lập trình web - Nhóm 1"
                    disabled={loading}
                />

                <Box sx={{ mt: 3 }}>
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={loading || !name.trim()}
                        sx={{ height: 48 }}
                    >
                        {loading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Tạo lớp học'
                        )}
                    </Button>
                </Box>
            </form>
        </Paper>
    );
};

export default CreateClass; 