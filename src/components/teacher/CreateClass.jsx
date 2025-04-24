import { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Alert,
    CircularProgress,
    Stack
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
        } catch (error) {
            setError(error.message || 'Đã xảy ra lỗi khi tạo lớp học.');
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
                    Tạo lớp học thành công! Bạn có thể quay lại bảng điều khiển.
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

                <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
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
                    <Button
                        variant="outlined"
                        fullWidth
                        sx={{ height: 48 }}
                        onClick={() => navigate('/teacher')}
                    >
                        Quay lại
                    </Button>
                </Stack>
            </form>
        </Paper>
    );
};

export default CreateClass;