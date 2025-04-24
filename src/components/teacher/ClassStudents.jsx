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
  Tabs,
  Tab,
  TablePagination,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Delete, UploadFile, Group, AddCircleOutline, Search } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
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

  const [currentTab, setCurrentTab] = useState(0); // State for tab navigation

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Pagination state
  const [page, setPage] = useState(0); // Current page
  const [rowsPerPage, setRowsPerPage] = useState(5); // Rows per page

  // Calculate the sliced data for the current page
  const paginatedStudents = students.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page
  };

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
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          p: 3,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "primary.main",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Group sx={{ fontSize: 40 }} /> Quản lý Sinh viên - Lớp ID: {classId}
        </Typography>

        <Button
          variant="contained"
          onClick={() => navigate("/teacher")}
          sx={{
            px: 4,
            borderRadius: 2,
            textTransform: "none",
            boxShadow: 3,
            "&:hover": {
              boxShadow: 4,
              transform: "translateY(-2px)",
            },
          }}
        >
          <ArrowBackIcon sx={{ mr: 1 }} />
          Quay lại
        </Button>
      </Box>

      <Paper
        sx={{
          mb: 3,
          borderRadius: 3,
          boxShadow: 3,
        }}
      >
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            "& .MuiTabs-indicator": {
              height: 4,
              borderRadius: 2,
            },
          }}
        >
          <Tab
            label="Danh sách sinh viên"
            sx={{
              fontSize: "1rem",
              fontWeight: 600,
              textTransform: "none",
            }}
          />
          <Tab
            label="Quản lý thêm sinh viên"
            sx={{
              fontSize: "1rem",
              fontWeight: 600,
              textTransform: "none",
            }}
          />
        </Tabs>
      </Paper>

      {currentTab === 0 && (
        <Paper
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: 3,
            position: "relative",
          }}
        >
          <TableContainer>
            <Typography
              variant="h6"
              sx={{
                p: 2,
                fontWeight: 600,
                textAlign: "center",
                position: "sticky",
                top: 0,
                zIndex: 1,
              }}
              >
            Sĩ số: {students.length}
            </Typography>
            <Table>
              <TableHead sx={{ bgcolor: "primary.light" }}>
                <TableRow>
                  <TableCell
                    sx={{
                      color: "common.white",
                      fontSize: "1.1rem",
                      py: 3,
                      fontWeight: 600,
                    }}
                  >
                    MSSV
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "common.white",
                      fontSize: "1.1rem",
                      py: 3,
                      fontWeight: 600,
                    }}
                  >
                    Tên sinh viên
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      color: "common.white",
                      fontSize: "1.1rem",
                      py: 3,
                      fontWeight: 600,
                    }}
                  >
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedStudents.map((student) => (
                  <TableRow
                    key={student.id}
                    hover
                    sx={{
                      transition: "background-color 0.2s",
                      "&:last-child td": { borderBottom: 0 },
                    }}
                  >
                    <TableCell sx={{ py: 2.5, fontWeight: 500 }}>
                      {student.studentId || "N/A"}
                    </TableCell>
                    <TableCell sx={{ py: 2.5 }}>{student.name}</TableCell>
                    <TableCell align="center" sx={{ py: 2.5 }}>
                      <IconButton
                        onClick={() =>
                          handleRemoveStudent(student.id, student.name)
                        }
                        sx={{
                          color: "error.main",
                          "&:hover": {
                            bgcolor: "error.light",
                            transform: "scale(1.1)",
                          },
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
               <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                component="div"
                                count={students.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                labelRowsPerPage="Số lớp mỗi trang:"
                                labelDisplayedRows={({ from, to, count }) =>
                                    `${from}-${to} trên ${count !== -1 ? count : `hơn ${to}`}`
                                }
                                sx={{ mt: 2 }}
                            />
          </TableContainer>

          {loading && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: "rgba(255, 255, 255, 0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress size={60} thickness={4} />
            </Box>
          )}
        </Paper>
      )}

      {currentTab === 1 && (
        <>
          {/* Phần thêm thủ công */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: 3 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "text.primary",
              }}
            >
              <AddCircleOutline color="primary" /> Thêm sinh viên thủ công
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
          {/* Phần thêm sinh viên hàng loạt */}
          <Paper
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 3,
              boxShadow: 3,
              bgcolor: "background.default",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "text.primary",
              }}
            >
              <UploadFile color="primary" /> Thêm từ file Excel/CSV
            </Typography>

            {bulkUploadError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {bulkUploadError}
              </Alert>
            )}

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadFile />}
                sx={{
                  textTransform: "none",
                  borderWidth: 2,
                  "&:hover": { borderWidth: 2 },
                }}
              >
                Chọn file
                <Input
                  type="file"
                  hidden
                  onChange={handleBulkFileChange}
                  accept=".xlsx, .xls, .csv"
                />
              </Button>

              {selectedBulkFile && (
                <Typography
                  variant="body2"
                  sx={{ fontStyle: "italic", color: "text.secondary" }}
                >
                  📄 {selectedBulkFile.name}
                </Typography>
              )}
            </Box>

            <Button
              variant="contained"
              onClick={handleBulkUpload}
              disabled={!selectedBulkFile || isUploadingBulk}
              sx={{
                mt: 2,
                px: 4,
                borderRadius: 2,
                textTransform: "none",
              }}
            >
              {isUploadingBulk ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Tải lên"
              )}
            </Button>
          </Paper>
        </>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4500}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          sx={{
            boxShadow: 3,
            borderRadius: 2,
            minWidth: 300,
            alignItems: "center",
          }}
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleCloseSnackbar}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          <Typography variant="body1" fontWeight={500}>
            {snackbar.message}
          </Typography>
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ClassStudents;

