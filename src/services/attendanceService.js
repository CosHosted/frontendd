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
    throw new Error(error.response?.data?.message || 'Điểm danh thất bại');
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
