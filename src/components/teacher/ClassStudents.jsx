import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Autocomplete,
  Snackbar,
  Input,
  Divider,
} from "@mui/material";

import { Delete, UploadFile } from "@mui/icons-material";
import * as classService from "../../services/classService";
import useDebounce from "../../hooks/useDebounce"; // hook debounce

const ClassStudents = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // State cho tìm kiếm và thêm sinh viên
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // State cho upload file hàng loạt
  const [selectedBulkFile, setSelectedBulkFile] = useState(null);
  const [isUploadingBulk, setIsUploadingBulk] = useState(false); // Loading cho upload file
  const [bulkUploadError, setBulkUploadError] = useState(null); // Lỗi riêng cho upload

  const debouncedSearchTerm = useDebounce(searchTerm, 500); // Debounce 500ms

  // Hàm fetch danh sách sinh viên của lớp
  const fetchStudents = useCallback(async () => {
    if (!classId) {
      setError("Không tìm thấy ID lớp học.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null); // Clear lỗi trước khi fetch
    setBulkUploadError(null); // Clear lỗi upload cũ
    try {
      const data = await classService.getClassStudents(classId);
      setStudents(data || []); // Đảm bảo là mảng
      setError(null);
    } catch (err) {
      console.error("Fetch students error:", err);
      setError(err.message || "Lỗi khi tải danh sách sinh viên.");
      setStudents([]); // Reset nếu lỗi
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Hàm tìm kiếm sinh viên
  useEffect(() => {
    const search = async () => {
      if (!debouncedSearchTerm.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      try {
        const results = await classService.searchStudents(debouncedSearchTerm);
        // Lọc ra những sinh viên chưa có trong lớp hiện tại
        const currentStudentIds = new Set(students.map((s) => s.id));
        const filteredResults = results.filter(
          (s) => !currentStudentIds.has(s.id)
        );
        setSearchResults(filteredResults || []);
      } catch (err) {
        console.error("Search students error:", err);
        setSearchResults([]); // Reset nếu lỗi
      } finally {
        setIsSearching(false);
      }
    };
    search();
  }, [debouncedSearchTerm, students]); // Thêm students vào dependencies

  // Hàm xử lý khi chọn sinh viên từ Autocomplete
  const handleStudentSelect = (event, newValue) => {
    setSelectedStudent(newValue);
  };

  // Hàm xử lý khi thay đổi input tìm kiếm
  const handleSearchInputChange = (event, newInputValue) => {
    setSearchTerm(newInputValue);
  };

  // Hàm thêm sinh viên vào lớp
  const handleAddSingleStudent = async () => {
    if (!selectedStudent || !classId) return;
    setIsAdding(true);
    setError(null); // Clear previous errors
    try {
      await classService.addStudentToClass(classId, selectedStudent.id);
      setSnackbar({
        open: true,
        message: `Đã thêm sinh viên "${selectedStudent.name}" vào lớp.`,
        severity: "success",
      });
      setSelectedStudent(null); // Reset autocomplete
      setSearchTerm(""); // Reset search term
      setSearchResults([]); // Clear results
      await fetchStudents(); // Tải lại danh sách sinh viên
    } catch (err) {
      console.error("Add student error:", err);
      setError(err.message || "Lỗi khi thêm sinh viên.");
      setSnackbar({
        open: true,
        message: err.message || "Lỗi khi thêm sinh viên.",
        severity: "error",
      });
    } finally {
      setIsAdding(false);
    }
  };

  // Hàm xóa sinh viên khỏi lớp
  const handleRemoveStudent = async (studentId, studentName) => {
    if (!classId) return;
    if (
      window.confirm(
        `Bạn có chắc muốn xóa sinh viên "${studentName}" khỏi lớp này?`
      )
    ) {
      setError(null);
      try {
        await classService.removeStudentFromClass(classId, studentId);
        setSnackbar({
          open: true,
          message: `Đã xóa sinh viên "${studentName}" khỏi lớp.`,
          severity: "success",
        });
        await fetchStudents(); // Tải lại danh sách
      } catch (err) {
        console.error("Remove student error:", err);
        setError(err.message || "Lỗi khi xóa sinh viên.");
        setSnackbar({
          open: true,
          message: err.message || "Lỗi khi xóa sinh viên.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    }
  };
  // ---- HÀM CHO UPLOAD FILE HÀNG LOẠT ----
  const handleBulkFileChange = (event) => {
    setBulkUploadError(null); // Clear lỗi upload cũ
    const file = event.target.files[0];
    if (file) {
      if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
        setBulkUploadError(
          "Chỉ chấp nhận file Excel (.xlsx, .xls) hoặc CSV (.csv)."
        );
        setSelectedBulkFile(null);
        event.target.value = null;
        return;
      }
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setBulkUploadError(
          `Kích thước file không được vượt quá ${maxSize / 1024 / 1024}MB.`
        );
        setSelectedBulkFile(null);
        event.target.value = null;
        return;
      }
      setSelectedBulkFile(file);
    } else {
      setSelectedBulkFile(null);
    }
  };

  const handleBulkUpload = async () => {
    if (!selectedBulkFile || !classId) {
      setBulkUploadError("Vui lòng chọn file để tải lên.");
      return;
    }
    setIsUploadingBulk(true);
    setBulkUploadError(null);

    const formData = new FormData();
    // 'studentsFile' phải khớp với tên field trong route backend (classRoutes.js)
    formData.append("studentsFile", selectedBulkFile);

    try {
      // Gọi API service mới cho upload danh sách sinh viên vào lớp
      const response = await classService.bulkAddStudentsToClass(
        classId,
        formData
      );
      // Hiển thị thông báo chi tiết từ backend
      let successMessage = response.message || "Upload thành công!";
      if (response.details) {
        if (response.details.alreadyInClass)
          successMessage += ` ${response.details.alreadyInClass}`;
        if (response.details.notFound)
          successMessage += ` ${response.details.notFound}`;
      }
      setSnackbar({ open: true, message: successMessage, severity: "success" });
      setSelectedBulkFile(null); // Reset state
      document.getElementById("bulk-student-upload-input").value = null; // Reset input
      await fetchStudents(); // Tải lại danh sách sinh viên
    } catch (err) {
      console.error("Bulk add students error:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Upload thất bại. Vui lòng thử lại.";
      setBulkUploadError(errorMsg); // Hiển thị lỗi riêng cho upload
      setSnackbar({ open: true, message: errorMsg, severity: "error" });
    } finally {
      setIsUploadingBulk(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  if (!classId) {
    return (
      <Box>
        <Alert severity="error">
          Không tìm thấy ID lớp học. Vui lòng quay lại.
        </Alert>
        <Button
          variant="outlined"
          onClick={() => navigate("/teacher/classes")}
          sx={{ mt: 2 }}
        >
          Quay lại danh sách lớp
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" component="h2" mb={2}>
        Quản lý sinh viên lớp (ID: {classId})
      </Typography>

      {error && !bulkUploadError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Phần thêm sinh viên hàng loạt bằng file */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" mb={1}>
          Thêm sinh viên hàng loạt (Excel/CSV)
        </Typography>
        {/* Hiển thị lỗi riêng của upload file */}
        {bulkUploadError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {bulkUploadError}
          </Alert>
        )}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadFile />}
            disabled={isUploadingBulk}
          >
            Chọn File MSSV
            <Input
              type="file"
              id="bulk-student-upload-input"
              hidden
              onChange={handleBulkFileChange}
              accept=".xlsx, .xls, .csv"
            />
          </Button>
          {selectedBulkFile && (
            <Typography variant="body2" sx={{ fontStyle: "italic" }}>
              {selectedBulkFile.name}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          onClick={handleBulkUpload}
          disabled={!selectedBulkFile || isUploadingBulk}
          startIcon={
            isUploadingBulk ? (
              <CircularProgress size={20} color="inherit" />
            ) : null
          }
        >
          {isUploadingBulk ? "Đang xử lý..." : "Thêm vào lớp"}
        </Button>
      </Paper>

      <Divider sx={{ my: 3 }} />
      {/* Phần tìm kiếm và thêm sinh viên */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" mb={1}>
          Thêm sinh viên vào lớp
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Autocomplete
            sx={{ flexGrow: 1 }}
            options={searchResults}
            getOptionLabel={(option) =>
              `${option.name} (${option.studentId || "N/A"})`
            } // Hiển thị tên và mã SV
            filterOptions={(x) => x} // Disable built-in filtering
            value={selectedStudent}
            onChange={handleStudentSelect}
            inputValue={searchTerm}
            onInputChange={handleSearchInputChange}
            loading={isSearching}
            loadingText="Đang tìm..."
            noOptionsText={
              searchTerm ? "Không tìm thấy sinh viên" : "Gõ để tìm kiếm"
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tìm kiếm sinh viên (theo tên hoặc MSSV)"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isSearching ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
          <Button
            variant="contained"
            onClick={handleAddSingleStudent}
            disabled={!selectedStudent || isAdding || loading}
          >
            {isAdding ? <CircularProgress size={24} /> : "Thêm"}
          </Button>
        </Box>
      </Paper>

      {/* Bảng danh sách sinh viên hiện có */}
      <Typography variant="h6" mb={1}>
        Danh sách sinh viên trong lớp
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>MSSV</TableCell>
              <TableCell>Tên sinh viên</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  Lớp học chưa có sinh viên nào.
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.studentId || "N/A"}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="error"
                      onClick={() =>
                        handleRemoveStudent(student.id, student.name)
                      }
                      disabled={loading}
                      title="Xóa khỏi lớp"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Button
        variant="outlined"
        onClick={() => navigate("/teacher/classes")}
        sx={{ mt: 3 }}
      >
        Quay lại danh sách lớp
      </Button>

      {/* Snackbar để hiển thị thông báo */}
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

export default ClassStudents;

