import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  DialogContentText,
  Slider,
  Modal,
  Chip
} from "@mui/material";
import { Delete, QrCodeScanner as QrCodeIcon, Close as CloseIcon } from "@mui/icons-material";
import * as classService from "../../services/classService";
import * as attendanceService from "../../services/attendanceService";
import { useParams, useNavigate } from "react-router-dom";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const DAYS_OF_WEEK = [
  { value: 1, label: "Thứ 2" },
  { value: 2, label: "Thứ 3" },
  { value: 3, label: "Thứ 4" },
  { value: 4, label: "Thứ 5" },
  { value: 5, label: "Thứ 6" },
  { value: 6, label: "Thứ 7" },
  { value: 0, label: "Chủ nhật" },
];

const ClassSchedule = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    dayOfWeek: "",
    startTime: "",
    endTime: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const [openQrDialog, setOpenQrDialog] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState(null);
  const [selectedScheduleForQr, setSelectedScheduleForQr] = useState(null);
  const [openDurationDialog, setOpenDurationDialog] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [scheduleToGenerateQrFor, setScheduleToGenerateQrFor] = useState(null);
  const [openZoomedQrModal, setOpenZoomedQrModal] = useState(false);
  const [zoomedQrCodeUrl, setZoomedQrCodeUrl] = useState("");

  const fetchSchedules = useCallback(async () => {
    if (!classId) {
      setError("Không tìm thấy thông tin lớp học");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await classService.getClassSchedules(classId);
      setSchedules(data || []);
      setError(null);
    } catch (err) {
      console.error("Fetch schedules error:", err);
      setError(err.message || "Lỗi khi tải lịch học.");
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const handleOpenAddDialog = () => {
    if (!classId) {
      setError("Không tìm thấy thông tin lớp học để thêm lịch.");
      return;
    }
    setFormData({ dayOfWeek: "", startTime: "", endTime: "" });
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitAddSchedule = async (e) => {
    e.preventDefault();
    if (!classId) {
      setError("Không tìm thấy thông tin lớp học.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await classService.createSchedule(classId, formData);
      handleCloseAddDialog();
      setSnackbar({
        open: true,
        message: "Thêm lịch học thành công!",
        severity: "success",
      });
      await fetchSchedules();
    } catch (err) {
      console.error("Add schedule error:", err);
      setError(err.message || "Lỗi khi thêm lịch học.");
      setSnackbar({
        open: true,
        message: err.message || "Lỗi khi thêm lịch học.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!classId) {
      setError("Không tìm thấy thông tin lớp học.");
      return;
    }
    if (window.confirm("Bạn có chắc chắn muốn xóa lịch học này?")) {
      setLoading(true);
      setError(null);
      try {
        await classService.deleteSchedule(classId, scheduleId);
        setSnackbar({
          open: true,
          message: "Xóa lịch học thành công!",
          severity: "success",
        });
        await fetchSchedules();
      } catch (err) {
        console.error("Delete schedule error:", err);
        setError(err.message || "Lỗi khi xóa lịch học.");
        setSnackbar({
          open: true,
          message: err.message || "Lỗi khi xóa lịch học.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOpenQrDialog = (schedule) => {
    if (!classId) {
      setSnackbar({
        open: true,
        message: "Thiếu ID lớp học.",
        severity: "error",
      });
      return;
    }
    setScheduleToGenerateQrFor(schedule);
    setDurationMinutes(15);
    setOpenDurationDialog(true);
  };

  const handleCloseQrDialog = () => {
    setOpenQrDialog(false);
    setQrCodeUrl("");
    setQrError(null);
    setSelectedScheduleForQr(null);
  };

  const handleCloseDurationDialog = () => {
    setOpenDurationDialog(false);
    setScheduleToGenerateQrFor(null);
  };

  const handleConfirmDurationAndGenerateQr = async () => {
    if (!scheduleToGenerateQrFor || !classId) {
      setSnackbar({
        open: true,
        message: "Lỗi: Thiếu thông tin lịch học hoặc lớp.",
        severity: "error",
      });
      handleCloseDurationDialog();
      return;
    }

    const selectedDuration = parseInt(durationMinutes, 10);
    if (isNaN(selectedDuration) || selectedDuration <= 0) {
      setSnackbar({
        open: true,
        message: "Thời gian hiệu lực không hợp lệ.",
        severity: "error",
      });
      return;
    }

    handleCloseDurationDialog();
    setSelectedScheduleForQr(scheduleToGenerateQrFor);
    setQrLoading(true);
    setQrError(null);
    setQrCodeUrl("");
    setOpenQrDialog(true);

    try {
      console.log(`[Frontend Debug] Calling generateQR with duration: ${selectedDuration}`);
      console.log(`Generating QR for class ${classId}, schedule ${scheduleToGenerateQrFor.id} with duration ${selectedDuration} minutes`);
      const data = await attendanceService.generateQR(classId, scheduleToGenerateQrFor.id, { duration: selectedDuration });
      setQrCodeUrl(data.qrCodeURL);
    } catch (err) {
      console.error("Generate QR error with duration:", err);
      setQrError(err.message || "Lỗi khi tạo mã QR.");
      setSnackbar({
        open: true,
        message: err.message || "Lỗi khi tạo mã QR.",
        severity: "error",
      });
    } finally {
      setQrLoading(false);
    }
  };

  const handleDurationChange = (event) => {
    setDurationMinutes(event.target.value);
  };

  const handleZoomChange = (event, newValue) => {
    setQrZoomLevel(newValue);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenZoomedQrModal = (url) => {
    setZoomedQrCodeUrl(url);
    setOpenZoomedQrModal(true);
  };

  const handleCloseZoomedQrModal = () => {
    setOpenZoomedQrModal(false);
    setZoomedQrCodeUrl("");
  };

  if (!classId) {
    return (
      <Box>
        <Alert severity="error">
          Không tìm thấy thông tin lớp học. Vui lòng thử lại.
        </Alert>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/teacher")}
          sx={{ mt: 2 }}
        >
          Quay lại
        </Button>
      </Box>
    );
  }

  if (loading && schedules.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#f9f9f9', borderRadius: 2, boxShadow: 2 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        sx={{ backgroundColor: '#e3f2fd', p: 2, borderRadius: 2, boxShadow: 1 }}
      >
        <Typography variant="h5" component="h2" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
          <CalendarMonthIcon fontSize="medium" sx={{ mr: 1 }} />
          Quản lý lịch học (Lớp ID: {classId})
        </Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate("/teacher")}
            sx={{ mr: 2, textTransform: 'none', fontWeight: 'bold' }}
          >
            Quay lại
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenAddDialog}
            sx={{ textTransform: 'none', fontWeight: 'bold' }}
          >
            Thêm lịch học
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2, boxShadow: 1 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#bbdefb' }}>
              <TableCell sx={{ fontWeight: 'bold', color: '#0d47a1' }}>Thứ</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#0d47a1' }}>Giờ bắt đầu</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#0d47a1' }}>Giờ kết thúc</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', color: '#0d47a1' }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schedules.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ color: '#757575', fontStyle: 'italic' }}>
                  Chưa có lịch học nào
                </TableCell>
              </TableRow>
            ) : (
              schedules.map((schedule) => (
                <TableRow key={schedule.id} hover sx={{ '&:hover': { backgroundColor: '#e3f2fd' } }}>
                  <TableCell>
                    {DAYS_OF_WEEK.find(
                      (day) => day.value === schedule.dayOfWeek
                    )?.label || "N/A"}
                  </TableCell>
                  <TableCell>{schedule.startTime}</TableCell>
                  <TableCell>{schedule.endTime}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenQrDialog(schedule)}
                      title="Tạo mã QR điểm danh"
                      disabled={loading}
                    >
                      <QrCodeIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteSchedule(schedule.id)}
                      title="Xóa lịch học"
                      disabled={loading}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
            {loading && schedules.length > 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <CircularProgress size={24} /> Đang tải lại...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openAddDialog} onClose={handleCloseAddDialog}>
        <DialogTitle>Thêm lịch học mới</DialogTitle>
        <DialogContent>
  <Box
    component="form"
    onSubmit={handleSubmitAddSchedule}
    sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}
  >
    <TextField
      select
      fullWidth
      label="Chọn thứ"
      name="dayOfWeek"
      value={formData.dayOfWeek}
      onChange={handleChange}
      InputProps={{ startAdornment: <CalendarMonthIcon color="action" /> }}
    >
      {DAYS_OF_WEEK.map(day => (
        <MenuItem key={day.value} value={day.value}>
          <Box display="flex" alignItems="center" gap={1}>
            <EventIcon fontSize="small" />
            {day.label}
          </Box>
        </MenuItem>
      ))}
    </TextField>

    <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
      {['startTime', 'endTime'].map((field) => (
        <TextField
          key={field}
          fullWidth
          label={field === 'startTime' ? 'Giờ bắt đầu' : 'Giờ kết thúc'}
          name={field}
          type="time"
          value={formData[field]}
          onChange={handleChange}
          InputProps={{
            startAdornment: <AccessTimeIcon/>,
            inputProps: { step: 300 }
            
          }}
        />
      ))}
    </Box>
  </Box>
</DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Hủy</Button>
          <Button
            onClick={handleSubmitAddSchedule}
            variant="contained"
            color="primary"
            disabled={
              !formData.dayOfWeek ||
              !formData.startTime ||
              !formData.endTime ||
              loading
            }
          >
            {loading ? <CircularProgress size={24} /> : "Thêm mới"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDurationDialog} onClose={handleCloseDurationDialog}
      maxWidth="xs" fullWidth>
        <DialogTitle sx={{bgcolor:'primary.main', color: 'white'}}>
          Tùy chỉnh thời gian QR
          </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2,color: 'text.secondary' }}>
            Chọn thời gian hiệu lực cho mã QR điểm danh (tính bằng phút).
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
            InputProps={{
              inputProps: { 
                min: 1 ,
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
            }}}
          />
        </DialogContent>
        <DialogActions sx ={{ bgcolor: 'background.paper', pb: 2 ,px: 3}}>
          <Button onClick={handleCloseDurationDialog}>Hủy</Button>
          <Button onClick={handleConfirmDurationAndGenerateQr} variant="contained">
            Tạo mã QR
          </Button>
        </DialogActions>
      </Dialog>

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
          }}
        >
          <Typography
            id="qr-modal-title"
            variant="h6"
            component="h2"
            sx={{ mb: 2, fontWeight: 600, color: 'primary.main', textAlign: 'center' }}
          >
            Mã QR Điểm Danh
          </Typography>

          <Box
            id="qr-modal-description"
            sx={{ textAlign: "center", flexGrow: 1 }}
          >
            {qrLoading && <CircularProgress sx={{ my: 4 }} />}
            {qrError && (
              <Alert severity="error" sx={{ my: 2 }}>
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
                  justifyContent: "center",
                  gap: 2,
                }}
              >
                <DialogContentText sx={{ mb: 2,color: 'text.secondary' }}>
                  Sinh viên quét mã này để điểm danh.
                  {durationMinutes && ` Mã sẽ hết hạn sau ${durationMinutes} phút.`}
                  {selectedScheduleForQr &&
                    ` (Buổi học: ${
                      DAYS_OF_WEEK.find(
                        (d) => d.value === selectedScheduleForQr.dayOfWeek
                      )?.label
                    } ${selectedScheduleForQr.startTime} - ${
                      selectedScheduleForQr.endTime
                    })`}
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
                      margin: "0 auto",
                      maxWidth: "100%",
                      height: "auto",
                      imageRendering: "crisp-edges",
                      border: "8px solid white",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      cursor: "pointer",
                    }}
                    onClick={() => handleOpenZoomedQrModal(qrCodeUrl)} 
                  />
                </Box>
              </Box>
            )}
            {!qrCodeUrl && !qrLoading && !qrError && (
              <Typography sx={{ my: 4 }}>
                Không có mã QR để hiển thị.
              </Typography>
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
            <Button onClick={handleCloseQrDialog}>Đóng</Button>
          </Box>
        </Paper>
      </Modal>
      <Modal
        open={openZoomedQrModal}
        onClose={handleCloseZoomedQrModal}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(3px)",
        }}
      >
        <Box
          sx={{
            bgcolor: "background.paper",
            borderRadius: 2,
            p: 3,
            maxWidth: "95%",
            maxHeight: "95%",
            position: "relative",
            outline: "none",
          }}
        >
          <IconButton
            aria-label="close"
            onClick={handleCloseZoomedQrModal}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "text.secondary",
            }}
          >
            <CloseIcon />
          </IconButton>
          <img
            src={zoomedQrCodeUrl}
            alt="Mã QR phóng to"
            style={{
              minWidth: "90vh",
              maxWidth: "90vh",
              display: "block",
              margin: "0 auto",
            }}
          />
        </Box>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ borderRadius: 1 }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%", borderRadius: 1 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ClassSchedule;
