import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScannerState } from 'html5-qrcode';
import { Box, Typography, Button, Alert, Snackbar, CircularProgress } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import * as attendanceService from '../../services/attendanceService';

const QrScanner = () => {
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const [lastScanTime, setLastScanTime] = useState(0);
    const [isScanning, setIsScanning] = useState(false);
    const scannerInstanceRef = useRef(null);
    const readerId = "html5qr-code-full-region";

    const onScanSuccess = useCallback(async (decodedText) => {
        const currentTime = Date.now();
        if (currentTime - lastScanTime < 3000) {
            console.log("Scan throttled.");
            return;
        }
        setLastScanTime(currentTime);
        setError(null);

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
    }, [lastScanTime]);

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
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isScanning]);

    const toggleScanner = () => {
        setError(null);
        setIsScanning(prev => !prev);
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Box sx={{ maxWidth: 500, margin: 'auto', textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom> Quét mã QR để điểm danh </Typography>

            <Button
                variant="contained"
                onClick={toggleScanner}
                color={isScanning ? "warning" : "primary"}
                startIcon={isScanning ? <StopCircleIcon /> : <CameraAltIcon />}
                sx={{ mb: 2 }}
            >
                {isScanning ? 'Tắt Camera' : 'Bật Camera'}
            </Button>

            <Box
                id={readerId}
                sx={{
                    width: '100%',
                    minHeight: isScanning ? '300px' : '0px',
                    border: isScanning ? '1px solid lightgray' : 'none',
                    mb: 2,
                    '& button': { marginTop: '10px' },
                     '& #html5-qrcode-anchor-scan-type-change': { display: 'none' }
                }}
            />

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
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

export default QrScanner;