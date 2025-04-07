import { useState } from 'react';
import { Box, Button, Typography, Paper, CircularProgress } from '@mui/material';
import QRCode from 'qrcode.react';
import { generateQR } from '../../services/attendanceService';

const QRGenerator = ({ classId, scheduleId }) => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);

  const handleGenerateQR = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await generateQR(classId, scheduleId);
      setQrData(response.qrData);
      setExpiresAt(response.expiresAt);
    } catch (err) {
      setError(err.message || 'Không thể tạo mã QR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h6" gutterBottom>
        Tạo mã QR điểm danh
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      ) : qrData ? (
        <Box sx={{ my: 3 }}>
          <QRCode value={qrData} size={200} level="H" />
          {expiresAt && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Mã QR sẽ hết hạn vào: {new Date(expiresAt).toLocaleString()}
            </Typography>
          )}
        </Box>
      ) : (
        <Button
          variant="contained"
          onClick={handleGenerateQR}
          sx={{ my: 3 }}
        >
          Tạo mã QR
        </Button>
      )}

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
    </Paper>
  );
};

export default QRGenerator; 