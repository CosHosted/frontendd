import { useState } from 'react';
import { Box, Button, Typography, Alert, CircularProgress, Snackbar, Input } from '@mui/material';
import { UploadFile } from '@mui/icons-material';
import * as adminService from '../../services/adminService'; // Bạn cần tạo service này

const BulkCreateUsers = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

    const handleFileChange = (event) => {
        setError(null); // Clear previous errors
        const file = event.target.files[0];
        if (file) {
            // Chỉ chấp nhận file Excel
            if (!file.name.match(/\.(xlsx|xls)$/i)) { // Bỏ .csv
                setError('Chỉ chấp nhận file Excel (.xlsx, .xls).'); // Cập nhật thông báo lỗi
                setSelectedFile(null);
                event.target.value = null; 
                return;
            }
             // Kiểm tra kích thước file (ví dụ: 5MB)
             const maxSize = 5 * 1024 * 1024; 
             if (file.size > maxSize) {
                 setError(`Kích thước file không được vượt quá ${maxSize / 1024 / 1024}MB.`);
                 setSelectedFile(null);
                 event.target.value = null;
                 return;
             }
            setSelectedFile(file);
        } else {
            setSelectedFile(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Vui lòng chọn file để tải lên.');
            return;
        }
        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('usersFile', selectedFile); // 'usersFile' phải khớp với backend (multer)

        try {
            const response = await adminService.uploadUsers(formData); // Gọi API service
            setSnackbar({ open: true, message: response.message || 'Upload thành công!', severity: 'success' });
            setSelectedFile(null); // Reset state
            // Reset input file sau khi upload thành công
            document.getElementById('bulk-user-upload-input').value = null; 
        } catch (err) {
            console.error("Upload users error:", err);
            const errorMsg = err.response?.data?.message || err.message || 'Upload thất bại. Vui lòng thử lại.';
             let displayError = errorMsg;
             // Xử lý lỗi validation chi tiết hơn nếu có
             if (err.response?.data?.errors) {
                const validationErrors = err.response.data.errors.map(e => `${e.field}: ${e.message}`).join('\n');
                displayError = `${errorMsg}\nChi tiết:\n${validationErrors}`;
             }
            setError(displayError);
            setSnackbar({ open: true, message: errorMsg, severity: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
                Thêm hàng loạt người dùng (Excel/CSV)
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>{error}</Alert>}
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                 <Button
                    variant="outlined"
                    component="label" 
                    startIcon={<UploadFile />}
                    disabled={isLoading}
                >
                    Chọn File Excel
                    <Input
                        type="file"
                        id="bulk-user-upload-input" 
                        hidden 
                        onChange={handleFileChange}
                        accept=".xlsx, .xls" // Bỏ .csv
                    />
                </Button>

                {selectedFile && (
                    <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                        Đã chọn: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </Typography>
                )}
            </Box>

            <Button
                variant="contained"
                color="primary"
                onClick={handleUpload}
                disabled={!selectedFile || isLoading}
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
            >
                {isLoading ? 'Đang tải lên...' : 'Tải lên và Tạo người dùng'}
            </Button>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default BulkCreateUsers;
