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
  Slider,
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
  const [formData, setFormData] = useState({ dayOfWeek: "", startTime: "", endTime: "" });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openQrDialog, setOpenQrDialog] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [qrZoomLevel, setQrZoomLevel] = useState(1);
  const [openDurationDialog, setOpenDurationDialog] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [scheduleToGenerateQrFor, setScheduleToGenerateQrFor] = useState(null);

  const fetchSchedules = useCallback(async () => {
    if (!classId) {
      setError("Không tìm thấy thông tin lớp học.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await classService.getClassSchedules(classId);
      setSchedules(data || []);
      setError(null);
    } catch (err) {
      console.error("Lỗi tải lịch học:", err);
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
    setFormData({ dayOfWeek: "", startTime: "", endTime: "" });
    setOpenAddDialog(true);
  };

  const handleSubmitAddSchedule = async (e) => {
    e.preventDefault();
    if (!classId) return;
    setLoading(true);
    try {
      await classService.createSchedule(classId, formData);
      setOpenAddDialog(false);
      setSnackbar({ open: true, message: "Thêm lịch học thành công!", severity: "success" });
      fetchSchedules();
    } catch (err) {
      setSnackbar({ open: true, message: err.message || "Lỗi khi thêm lịch học.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!classId || !window.confirm("Bạn có chắc chắn muốn xóa lịch học này?")) return;
    setLoading(true);
    try {
      await classService.deleteSchedule(classId, scheduleId);
      setSnackbar({ open: true, message: "Xóa lịch học thành công!", severity: "success" });
      fetchSchedules();
    } catch (err) {
      setSnackbar({ open: true, message: err.message || "Lỗi khi xóa lịch học.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQr = (schedule) => {
    setScheduleToGenerateQrFor(schedule);
    setDurationMinutes(15);
    setOpenDurationDialog(true);
  };

  const confirmGenerateQr = async () => {
    if (!classId || !scheduleToGenerateQrFor) return;
    setOpenDurationDialog(false);
    setQrLoading(true);
    setOpenQrDialog(true);
    try {
      const data = await attendanceService.generateQR(classId, scheduleToGenerateQrFor.id, { duration: durationMinutes });
      setQrCodeUrl(data.qrCodeURL);
    } catch (err) {
      setSnackbar({ open: true, message: err.message || "Lỗi khi tạo mã QR.", severity: "error" });
    } finally {
      setQrLoading(false);
    }
  };

  const handleZoomChange = (_, value) => {
    setQrZoomLevel(value);
  };

  const handleSnackbarClose = (_, reason) => {
    if (reason !== "clickaway") setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Quản lý lịch học (Lớp ID: {classId})</Typography>
        <Box>
          <Button variant="outlined" onClick={() => navigate("/teacher/classes")} sx={{ mr: 2 }}>
            Quay lại
          </Button>
          <Button variant="contained" onClick={handleOpenAddDialog}>Thêm lịch học</Button>
        </Box>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

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
            {schedules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">Chưa có lịch học nào</TableCell>
              </TableRow>
            ) : (
              schedules.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{DAYS_OF_WEEK.find(d => d.value === s.dayOfWeek)?.label}</TableCell>
                  <TableCell>{s.startTime}</TableCell>
                  <TableCell>{s.endTime}</TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => handleGenerateQr(s)} title="Tạo QR điểm danh"><QrCodeIcon /></IconButton>
                    <IconButton onClick={() => handleDeleteSchedule(s.id)} title="Xóa"><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Schedule Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Thêm lịch học</DialogTitle>
        <DialogContent>
          <TextField
            select fullWidth required margin="normal"
            label="Thứ" name="dayOfWeek" value={formData.dayOfWeek}
            onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
          >
            {DAYS_OF_WEEK.map((d) => (
              <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth required margin="normal" type="time"
            label="Giờ bắt đầu" name="startTime" InputLabelProps={{ shrink: true }}
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
          />
          <TextField
            fullWidth required margin="normal" type="time"
            label="Giờ kết thúc" name="endTime" InputLabelProps={{ shrink: true }}
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Hủy</Button>
          <Button onClick={handleSubmitAddSchedule} variant="contained">Thêm</Button>
        </DialogActions>
      </Dialog>

      {/* Duration Dialog */}
      <Dialog open={openDurationDialog} onClose={() => setOpenDurationDialog(false)}>
  <DialogTitle>Chọn thời gian hiệu lực QR</DialogTitle>
  <DialogContent>
    <Typography gutterBottom>
      Thời gian hiệu lực: <strong>{durationMinutes} phút</strong>
    </Typography>
    <Slider
      value={durationMinutes}
      onChange={(_, v) => setDurationMinutes(v)}
      valueLabelDisplay="auto"
      step={1}
      min={1}
      max={15}
      marks={[
        { value: 1, label: "1" },
        { value: 5, label: "5" },
        { value: 10, label: "10" },
        { value: 15, label: "15" },
      ]}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenDurationDialog(false)}>Hủy</Button>
    <Button onClick={confirmGenerateQr} variant="contained">Tạo mã QR</Button>
  </DialogActions>
</Dialog>


      {/* QR Code Dialog */}
      <Dialog open={openQrDialog} onClose={() => setOpenQrDialog(false)}>
        <DialogTitle>Mã QR điểm danh</DialogTitle>
        <DialogContent>
          {qrLoading ? (
            <CircularProgress />
          ) : qrCodeUrl ? (
            <>
              <Box display="flex" justifyContent="center" my={2}>
                <img src={qrCodeUrl} alt="QR Code" style={{ width: `${300 * qrZoomLevel}px`, height: `${300 * qrZoomLevel}px` }} />
              </Box>
              <Typography gutterBottom>Phóng to</Typography>
              <Slider
                value={qrZoomLevel}
                onChange={handleZoomChange}
                min={0.5}
                max={2}
                step={0.1}
                valueLabelDisplay="auto"
              />
            </>
          ) : (
            <Typography color="error">Không thể hiển thị mã QR.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQrDialog(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ClassSchedule;
