import api from '../config/api';

export const generateQR = async (classId, scheduleId, options = {}) => {
  try {
    const requestBody = {
      classId,
      scheduleId,
      duration: options.duration
    };
    console.log('[Frontend Service Debug] Sending generateQR request with body:', requestBody);
    
    const response = await api.post('/attendance/generate-qr', requestBody);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || error.response?.data?.message || 'Không thể tạo mã QR');
  }
};

export const checkIn = async (qrData) => {
  try {
    const response = await api.post('/attendance/check-in', { qrData });
    return response.data;
  } catch (error) {
    const statusCode = error.response?.status;
    const errorMessage = error.response?.data?.error; // Ưu tiên lấy từ 'error' field theo backend

    if (statusCode === 400 && errorMessage) {
      // Các lỗi cụ thể từ backend (status 400)
      if (errorMessage === "qrData là bắt buộc") {
        throw new Error("Thiếu dữ liệu QR.");
      }
      if (errorMessage === "Dữ liệu QR không hợp lệ") {
        throw new Error("Mã QR không đúng định dạng.");
      }
      if (errorMessage === "Mã QR đã hết hạn") {
        throw new Error("Mã QR đã hết hạn.");
      }
      if (errorMessage.startsWith("Chưa đến thời gian điểm danh") || errorMessage.startsWith("Đã hết thời gian điểm danh")) {
        throw new Error(errorMessage); // Hiển thị lỗi thời gian cụ thể từ backend
      }
      if (errorMessage === "Bạn đã điểm danh buổi học này") {
        throw new Error("Bạn đã điểm danh cho buổi học này rồi.");
      }
    }

    if (statusCode === 403 && errorMessage === "Bạn không thuộc lớp này") {
      throw new Error("Bạn không có trong danh sách lớp học này.");
    }

    if (statusCode === 404 && errorMessage) {
      if (errorMessage === "Không tìm thấy thông tin sinh viên") {
        throw new Error("Không tìm thấy thông tin tài khoản sinh viên của bạn.");
      }
      if (errorMessage === "Không tìm thấy lớp học") {
        throw new Error("Không tìm thấy lớp học được chỉ định trong mã QR.");
      }
      if (errorMessage === "Không tìm thấy buổi học") {
        throw new Error("Không tìm thấy buổi học được chỉ định trong mã QR.");
      }
    }

    // Lỗi 500 từ backend hoặc các lỗi không xác định khác
    if (errorMessage) {
      // Nếu có lỗi cụ thể từ backend mà chưa được xử lý ở trên
      throw new Error(errorMessage);
    } else {
      // Lỗi mạng hoặc lỗi không có phản hồi
      throw new Error('Điểm danh thất bại. Vui lòng kiểm tra kết nối và thử lại.');
    }
  }
};

export const getAttendanceHistory = async () => {
  try {
    const response = await api.get('/attendance/my-history');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể tải lịch sử điểm danh');
  }
};

export const getClassAttendanceHistory = async (classId) => {
  try {
    const response = await api.get(`/attendance/history/${classId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể tải lịch sử điểm danh của lớp');
  }
};

export const updateAttendanceTime = async (scheduleId, data) => {
  try {
    const response = await api.put(`/attendance/schedule/attendance-time`, {
      scheduleId,
      ...data
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể cập nhật thời gian điểm danh');
  }
};

// Lấy báo cáo điểm danh cho lớp học (giáo viên)
export const getClassAttendanceReport = async (classId, date) => {
  try {
    const response = await api.get(`/attendance/report/${classId}`, {
      params: { date },
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Không thể lấy báo cáo điểm danh" }
    );
  }
};

// Lấy danh sách sinh viên có mặt trong buổi học
export const getPresentStudents = async (classId, date) => {
  try {
    const response = await api.get(`/attendance/present/${classId}`, {
      params: { date },
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Không thể lấy danh sách sinh viên có mặt",
      }
    );
  }
};

// Lấy danh sách sinh viên vắng mặt trong buổi học
export const getAbsentStudents = async (classId, date) => {
  try {
    const response = await api.get(`/attendance/absent/${classId}`, {
      params: { date },
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Không thể lấy danh sách sinh viên vắng mặt",
      }
    );
  }
};

// Thêm điểm danh thủ công cho sinh viên (giáo viên)
export const addManualAttendance = async (classId, studentId, date) => {
  try {
    const response = await api.post(`/attendance/manual`, {
      classId,
      studentId,
      date,
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Không thể thêm điểm danh thủ công" }
    );
  }
};

// Xóa điểm danh của sinh viên (giáo viên)
export const removeAttendance = async (attendanceId) => {
  try {
    const response = await api.delete(`/attendance/${attendanceId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Không thể xóa điểm danh" };
  }
};
