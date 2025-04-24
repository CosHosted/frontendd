import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner, Html5QrcodeScannerState } from 'html5-qrcode';
import { Box, Typography, Button, Alert, Snackbar, CircularProgress } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import * as attendanceService from '../../services/attendanceService';

const QrScanner = () => {
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const [lastScanTime, setLastScanTime] = useState(0);
    const [isScanning, setIsScanning] = useState(false);
    const [checkinSuccess, setCheckinSuccess] = useState(false);
    const scannerInstanceRef = useRef(null);
    const readerId = "html5qr-code-full-region";
    const navigate = useNavigate();

    const onScanSuccess = useCallback(async (decodedText) => {
        const currentTime = Date.now();
        if (currentTime - lastScanTime < 3000) {
            console.log("Scan throttled.");
            return;
        }
        setLastScanTime(currentTime);
        setError(null);
        setCheckinSuccess(false);

        console.log('QR Data scanned:', decodedText);

        if (scannerInstanceRef.current &&
            typeof scannerInstanceRef.current.pause === 'function') {
            try {
                scannerInstanceRef.current.pause(true);
                console.log("Scanner paused.");
            } catch (e) { console.warn("Error pausing scanner:", e); }
        }

        try {
            const response = await attendanceService.checkIn(decodedText);
            console.log('Check-in response:', response);
            setSnackbar({ open: true, message: response.message || 'Điểm danh thành công!', severity: 'success' });
            setCheckinSuccess(true);

            if (scannerInstanceRef.current && typeof scannerInstanceRef.current.clear === 'function'){
                 await scannerInstanceRef.current.clear();
                 console.log("Scanner cleared after success.");
                 scannerInstanceRef.current = null;
                 setIsScanning(false);
            }

        } catch (err) {
            console.error('Check-in error:', err);
            const errorMessage = err.message || 'Lỗi không xác định. Vui lòng thử lại.';
            setError(errorMessage);
            setSnackbar({ open: true, message: errorMessage, severity: 'error' });

            if (scannerInstanceRef.current &&
                typeof scannerInstanceRef.current.resume === 'function') {
                 try {
                    scannerInstanceRef.current.resume();
                    console.log("Scanner resumed after error.");
                 } catch (e) { console.warn("Error resuming scanner after error:", e) }
            }
            setTimeout(() => setError(null), 5000);
        }
    }, [lastScanTime, navigate]);

    const onScanFailure = useCallback((scanError) => {
        if (!scanError?.toLowerCase().includes("qr code not found")) {
            console.warn(`QR Scan Failure: ${scanError}`);
        }
    }, []);

    useEffect(() => {
        let scannerInstance = null;

        if (isScanning) {
            console.log("Starting scanner...");
            setError(null);
            setCheckinSuccess(false);

            try {
                scannerInstance = new Html5QrcodeScanner(
                    readerId,
                    {
                        qrbox: { width: 250, height: 250 },
                        fps: 5,
                        rememberLastUsedCamera: true,
                        supportedScanTypes: [0]
                    },
                    /* verbose= */ false
                );

                scannerInstanceRef.current = scannerInstance;

                scannerInstance.render(onScanSuccess, onScanFailure);
                console.log("Scanner rendered.");

            } catch (initError) {
                console.error("Error initializing Html5QrcodeScanner:", initError);
                setError("Không thể khởi động trình quét QR. Kiểm tra quyền camera.");
                setIsScanning(false);
            }
        }

        return () => {
            console.log("Cleanup: Checking scanner instance...");
            const instanceToClear = scannerInstanceRef.current || scannerInstance;
            if (instanceToClear && typeof instanceToClear.clear === 'function') {
                instanceToClear.clear().then(() => {
                    console.log("Scanner cleared successfully.");
                    if (instanceToClear === scannerInstanceRef.current) {
                         scannerInstanceRef.current = null;
                    }
                }).catch(error => {
                    console.error("Error clearing scanner during cleanup:", error);
                     if (instanceToClear === scannerInstanceRef.current) {
                          scannerInstanceRef.current = null;
                     }
                });
            } else {
                 console.log("Cleanup: No scanner instance found or clear function unavailable.");
                 scannerInstanceRef.current = null;
            }
        };
    }, [isScanning, onScanSuccess, onScanFailure]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden' && isScanning) {
                console.log("Tab hidden, stopping scanner.");
                setIsScanning(false);
                setCheckinSuccess(false);
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isScanning]);

    const toggleScanner = () => {
        setError(null);
        setCheckinSuccess(false);
        setIsScanning(prev => !prev);
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Box
            sx={{
                maxWidth: 500,
                margin: 'auto',
                textAlign: 'center',
                padding: 3,
                borderRadius: 3,
                boxShadow: 3,
                bgcolor: 'background.paper'
            }}
        >
            <Button
                variant="outlined"
                onClick={handleGoBack}
                startIcon={<ArrowBackIcon />}
                sx={{ 
                    mb: 3,
                    display: 'flex',
                    alignSelf: 'flex-start',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 2,
                    '&:hover': {
                        boxShadow: 2,
                        transform: 'translateY(-1px)'
                    }
                 }}
            >
                Quay lại
            </Button>

            <Typography
                variant="h5"
                gutterBottom
                sx={{ mt: 1, fontWeight: 700, color: 'primary.main' }}
            >
                Quét mã QR để điểm danh
            </Typography>

            {!checkinSuccess && (
                <Button
                    variant="contained"
                    onClick={toggleScanner}
                    color={isScanning ? "warning" : "primary"}
                    startIcon={isScanning ? <StopCircleIcon /> : <CameraAltIcon />}
                    sx={{
                        mb: 2,
                        py: 1.5,
                        px: 4,
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
                    {isScanning ? 'Tắt Camera' : 'Bật Camera'}
                </Button>
            )}

            <Box
                id={readerId}
                sx={{
                    width: '100%',
                    minHeight: isScanning || checkinSuccess ? '300px' : '0px',
                    border: isScanning ? '1px solid lightgray' : 'none',
                    borderRadius: 2,
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: isScanning ? 'background.default' : 'transparent',
                    boxShadow: isScanning ? 2 : 'none',
                    flexDirection: 'column',
                    '& button': { marginTop: '10px' },
                    '& #html5-qrcode-anchor-scan-type-change': { display: 'none' },
                    '& #html5-qrcode-camera-selection': { marginTop: '10px' } 
                }}
            />

            {error && (
                <Alert severity="error" sx={{ mt: 2, borderRadius: 2, boxShadow: 1 }}>
                    {error}
                </Alert>
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{
                        width: '100%',
                        borderRadius: 2,
                        boxShadow: 2,
                        fontWeight: 500
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default QrScanner;