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
} from "@mui/material";
import { Delete, QrCodeScanner as QrCodeIcon } from "@mui/icons-material";
import * as classService from "../../services/classService";
import * as attendanceService from "../../services/attendanceService";
import { useParams, useNavigate } from "react-router-dom";


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
  const [qrZoomLevel, setQrZoomLevel] = useState(1);
  const [openDurationDialog, setOpenDurationDialog] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [scheduleToGenerateQrFor, setScheduleToGenerateQrFor] = useState(null);

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
    setQrZoomLevel(1);
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
    setQrZoomLevel(1);
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

  if (!classId) {
    return (
      <Box>
        <Alert severity="error">
          Không tìm thấy thông tin lớp học. Vui lòng thử lại.
        </Alert>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/teacher/classes")}
          sx={{ mt: 2 }}
        >
          Quay lại danh sách lớp
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
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" component="h2">
          Quản lý lịch học (Lớp ID: {classId})
        </Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate("/teacher/classes")}
            sx={{ mr: 2 }}
          >
            Quay lại
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenAddDialog}
          >
            Thêm lịch học
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Thứ</TableCell>
              <TableCell>Giờ bắt đầu</TableCell>
              <TableCell>Giờ kết thúc</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schedules.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Chưa có lịch học nào
                </TableCell>
              </TableRow>
            ) : (
              schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>
                    {DAYS_OF_WEEK.find(
                      (day) => day.value === schedule.dayOfWeek
                    )?.label || "N/A"}
                  </TableCell>
                  <TableCell>{schedule.startTime}</TableCell>
                  <TableCell>{schedule.endTime}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="secondary"
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
            sx={{ mt: 1 }}
          >
            <TextField
              select
              fullWidth
              label="Thứ"
              name="dayOfWeek"
              value={formData.dayOfWeek}
              onChange={handleChange}
              margin="normal"
              required
            >
              {DAYS_OF_WEEK.map((day) => (
                <MenuItem key={day.value} value={day.value}>
                  {day.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Giờ bắt đầu"
              name="startTime"
              type="time"
              value={formData.startTime}
              onChange={handleChange}
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }}
            />
            <TextField
              fullWidth
              label="Giờ kết thúc"
              name="endTime"
              type="time"
              value={formData.endTime}
              onChange={handleChange}
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }}
            />
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

      <Dialog open={openDurationDialog} onClose={handleCloseDurationDialog}>
        <DialogTitle>Tùy chỉnh thời gian QR</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Chọn thời gian hiệu lực cho mã QR điểm danh (tính bằng phút).
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="duration"
            label="Thời gian hiệu lực (phút)"
            type="number"
            fullWidth
            variant="standard"
            value={durationMinutes}
            onChange={handleDurationChange}
            InputProps={{
              inputProps: { 
                min: 1 
              }
            }}
          />
        </DialogContent>
        <DialogActions>
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
            sx={{ mb: 2 }}
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
                }}
              >
                <DialogContentText sx={{ mb: 2 }}>
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
                    width: "100%",
                    maxWidth: "500px",
                    maxHeight: "65vh",
                    overflow: "auto",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <img
                    src={qrCodeUrl}
                    alt="Mã QR điểm danh"
                    style={{
                      display: "block",
                      maxWidth: "100%",
                      height: "auto",
                      transform: `scale(${qrZoomLevel})`,
                      transition: "transform 0.2s ease-in-out",
                      transformOrigin: "center center",
                      willChange: "transform",
                    }}
                  />
                </Box>
              </Box>
            )}
            {!qrCodeUrl && !qrLoading && !qrError && (
              <Typography sx={{ my: 4 }}>
                Không có mã QR để hiển thị.
              </Typography>
            )}

            {qrCodeUrl && !qrLoading && !qrError && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  px: 1,
                  mt: 0,
                }}
              >
                <Typography variant="caption">Zoom:</Typography>
                <Slider
                  value={qrZoomLevel}
                  onChange={handleZoomChange}
                  aria-labelledby="qr-zoom-slider"
                  min={0.5}
                  max={3}
                  step={0.1}
                  size="small"
                />
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
            <Button onClick={handleCloseQrDialog}>Đóng</Button>
          </Box>
        </Paper>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ClassSchedule;
