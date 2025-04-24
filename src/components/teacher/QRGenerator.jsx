import { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Modal,
  Alert,
  Slider,
  Chip,
  IconButton
} from '@mui/material';
import QRCode from 'qrcode.react';
import { generateQR } from '../../services/attendanceService';
import { Close as CloseIcon, QrCode2 as QrCode2Icon, ZoomIn as ZoomInIcon, ZoomOut as ZoomOutIcon } from '@mui/icons-material';

const QRGenerator = ({ classId, scheduleId }) => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [openDurationDialog, setOpenDurationDialog] = useState(false);
  const [openQrDialog, setOpenQrDialog] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState(1);
  const [qrZoomLevel, setQrZoomLevel] = useState(1);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState(null);

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

  const handleOpenDurationDialog = () => {
    setOpenDurationDialog(true);
  };

  const handleCloseDurationDialog = () => {
    setOpenDurationDialog(false);
  };

  const handleDurationChange = (event) => {
    setDurationMinutes(event.target.value);
  };

  const handleConfirmDurationAndGenerateQr = async () => {
    try {
      setQrLoading(true);
      setQrError(null);
      const response = await generateQR(classId, scheduleId, durationMinutes);
      setQrCodeUrl(response.qrCodeUrl);
      setExpiresAt(response.expiresAt);
      setOpenQrDialog(true);
    } catch (err) {
      setQrError(err.message || 'Không thể tạo mã QR');
    } finally {
      setQrLoading(false);
      setOpenDurationDialog(false);
    }
  };

  const handleCloseQrDialog = () => {
    setOpenQrDialog(false);
  };

  const handleZoomChange = (event, newValue) => {
    setQrZoomLevel(newValue);
  };

  return (
    <>
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
            onClick={handleOpenDurationDialog}
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

      {/* Duration Dialog */}
      <Dialog 
        open={openDurationDialog} 
        onClose={handleCloseDurationDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          Tùy chỉnh thời gian QR
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <DialogContentText sx={{ mb: 2, color: 'text.secondary' }}>
            Chọn thời gian hiệu lực cho mã QR điểm danh (tối thiểu 1 phút).
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="duration"
            label="Thời gian hiệu lực (phút)"
            type="number"
            fullWidth
            variant="outlined"
            value={durationMinutes}
            onChange={handleDurationChange}
            error={durationMinutes < 1}
            helperText={durationMinutes < 1 && "Vui lòng nhập số phút lớn hơn 0"}
            InputProps={{
              inputProps: { 
                min: 1,
                style: { 
                  fontSize: '1.2rem',
                  textAlign: 'center',
                  padding: '12px 0'
                }
              }
            }}
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={handleCloseDurationDialog} 
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleConfirmDurationAndGenerateQr} 
            variant="contained"
            disabled={durationMinutes < 1}
            sx={{ borderRadius: 2 }}
          >
            Tạo mã QR
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR Modal */}
      <Modal
        open={openQrDialog}
        onClose={handleCloseQrDialog}
        aria-labelledby="qr-modal-title"
        aria-describedby="qr-modal-description"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Paper
          sx={{
            outline: "none",
            p: { xs: 2, sm: 3 },
            maxWidth: "90vw",
            width: "600px",
            maxHeight: "90vh",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            borderRadius: 3,
            boxShadow: 24,
            position: 'relative'
          }}
        >
          <IconButton
            aria-label="close"
            onClick={handleCloseQrDialog}
            sx={{
              position: 'absolute',
              right: 16,
              top: 16,
              color: 'text.secondary'
            }}
          >
            <CloseIcon />
          </IconButton>

          <Typography
            variant="h5"
            component="h2"
            sx={{ 
              mb: 2,
              fontWeight: 600,
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <QrCode2Icon fontSize="large" /> 
            Mã QR Điểm Danh
          </Typography>

          <Box sx={{ textAlign: "center", flexGrow: 1 }}>
            {qrLoading && (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                my: 4 
              }}>
                <CircularProgress 
                  size={40} 
                  thickness={4} 
                  sx={{ color: 'primary.main' }} 
                />
                <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                  Đang tạo mã QR...
                </Typography>
              </Box>
            )}

            {qrError && (
              <Alert 
                severity="error" 
                sx={{ 
                  my: 2,
                  textAlign: 'left',
                  '& .MuiAlert-message': { flexGrow: 1 }
                }}
              >
                {qrError}
              </Alert>
            )}

            {qrCodeUrl && !qrLoading && !qrError && (
              <Box
                sx={{
                  mt: 1,
                  mb: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <DialogContentText sx={{ mb: 2, color: 'text.secondary' }}>
                  Sinh viên quét mã này để điểm danh.
                </DialogContentText>

                <Box
                  sx={{
                    position: 'relative',
                    p: 2,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 1,
                    mb: 3,
                    width: '100%',
                    maxWidth: '500px',
                    mx: 'auto'
                  }}
                >
                  {durationMinutes > 0 && (
                    <Chip
                      label={`Hết hạn sau ${durationMinutes} phút`}
                      color="warning"
                      size="small"
                      sx={{ 
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        fontWeight: 500,
                        backdropFilter: 'blur(4px)',
                        bgcolor: 'rgba(255,255,255,0.8)'
                      }}
                    />
                  )}
                  <img
                    src={qrCodeUrl}
                    alt="Mã QR điểm danh"
                    style={{
                      display: "block",
                      maxWidth: "100%",
                      height: "auto",
                      transform: `scale(${qrZoomLevel})`,
                      transition: "transform 0.2s ease-in-out",
                      imageRendering: 'crisp-edges',
                      border: '8px solid white',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                </Box>

                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  px: 1,
                  width: '100%',
                  maxWidth: 400,
                  mx: 'auto'
                }}>
                  <IconButton 
                    onClick={() => handleZoomChange(null, Math.max(0.5, qrZoomLevel - 0.2))}
                    disabled={qrZoomLevel <= 0.5}
                    size="small"
                    sx={{ color: 'primary.main' }}
                  >
                    <ZoomOutIcon />
                  </IconButton>
                  <Slider
                    value={qrZoomLevel}
                    onChange={handleZoomChange}
                    aria-labelledby="qr-zoom-slider"
                    min={0.5}
                    max={3}
                    step={0.1}
                    sx={{ flexGrow: 1 }}
                    marks={[{ value: 1, label: '100%' }]}
                  />
                  <IconButton
                    onClick={() => handleZoomChange(null, Math.min(3, qrZoomLevel + 0.2))}
                    disabled={qrZoomLevel >= 3}
                    size="small"
                    sx={{ color: 'primary.main' }}
                  >
                    <ZoomInIcon />
                  </IconButton>
                </Box>
              </Box>
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mt: 2,
              pt: 2,
              borderTop: "1px solid rgba(0, 0, 0, 0.12)",
            }}
          >
            <Button 
              onClick={handleCloseQrDialog}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              Đóng
            </Button>
          </Box>
        </Paper>
      </Modal>
    </>
  );
};

export default QRGenerator;