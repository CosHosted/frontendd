import api from '../config/api';

// Lấy danh sách lớp học của giáo viên
export const getTeacherClasses = async () => {
    try {
        const response = await api.get('/classes/teacher');
        console.log('API Response:', response.data); // Debug log
        return response.data;
    } catch (error) {
        console.error('Error in getTeacherClasses:', error.response || error); // Debug log
        throw new Error(error.response?.data?.error || 'Không thể lấy danh sách lớp học');
    }
};

// Tạo lớp học mới
export const createClass = async (classData) => {
    try {
        const response = await api.post('/classes', classData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Không thể tạo lớp học');
    }
};

// Lấy thông tin chi tiết một lớp học
export const getClassById = async (classId) => {
    try {
        const response = await api.get(`/classes/${classId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Không thể lấy thông tin lớp học');
    }
};

// Lấy danh sách sinh viên của lớp
export const getClassStudents = async (classId) => {
    if (!classId) throw new Error('ClassId không được để trống');
    try {
        console.log(`Fetching students for class ${classId}`);
        const response = await api.get(`/classes/${classId}/students`);
        return response.data;
    } catch (error) {
        console.error('Error fetching class students:', error.response || error);
        throw new Error(error.response?.data?.error || 'Không thể lấy danh sách sinh viên');
    }
};

// Thêm sinh viên vào lớp học
export const addStudentToClass = async (classId, studentId) => {
    if (!classId || !studentId) throw new Error('ClassId và StudentId không được để trống');
    try {
        console.log(`Adding student ${studentId} to class ${classId}`);
        const response = await api.post(`/classes/${classId}/students/${studentId}`);
        return response.data; // Thường trả về message thành công
    } catch (error) {
        console.error('Error adding student to class:', error.response || error);
        throw new Error(error.response?.data?.error || 'Không thể thêm sinh viên vào lớp');
    }
};

// Xóa sinh viên khỏi lớp học
export const removeStudentFromClass = async (classId, studentId) => {
    if (!classId || !studentId) throw new Error('ClassId và StudentId không được để trống');
    try {
        console.log(`Removing student ${studentId} from class ${classId}`);
        // Method DELETE thường không cần body và không trả về body (204 No Content)
        await api.delete(`/classes/${classId}/students/${studentId}`); 
        return { message: 'Xóa sinh viên thành công' }; // Trả về message để xác nhận
    } catch (error) {
        console.error('Error removing student from class:', error.response || error);
        throw new Error(error.response?.data?.error || 'Không thể xóa sinh viên khỏi lớp');
    }
};

// Tạo lịch học mới cho lớp
export const createSchedule = async (classId, scheduleData) => {
    try {
        if (!classId) {
            throw new Error('ClassId không được để trống');
        }
        console.log('Creating schedule for class:', classId, scheduleData); // Debug log
        const response = await api.post(`/classes/${classId}/schedules`, scheduleData);
        return response.data;
    } catch (error) {
        console.error('Error in createSchedule:', error.response || error); // Debug log
        throw new Error(error.response?.data?.error || 'Không thể tạo lịch học');
    }
};

// Lấy danh sách lịch học của lớp
export const getClassSchedules = async (classId) => {
    try {
        if (!classId) {
            throw new Error('ClassId không được để trống');
        }
        console.log('Fetching schedules for class:', classId); // Debug log
        const response = await api.get(`/classes/${classId}/schedules`);
        console.log('Schedules response:', response.data); // Debug log
        return response.data;
    } catch (error) {
        console.error('Error in getClassSchedules:', error.response || error); // Debug log
        throw new Error(error.response?.data?.error || 'Không thể lấy lịch học của lớp');
    }
};

// Xóa lịch học
export const deleteSchedule = async (classId, scheduleId) => {
    try {
        if (!classId || !scheduleId) {
            throw new Error('ClassId và ScheduleId không được để trống');
        }
        await api.delete(`/classes/${classId}/schedules/${scheduleId}`);
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Không thể xóa lịch học');
    }
};

// Lấy báo cáo điểm danh của lớp
export const getClassAttendanceReport = async (classId) => {
    try {
        const response = await api.get(`/classes/${classId}/attendance-report`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Không thể lấy báo cáo điểm danh');
    }
};

// Tìm kiếm sinh viên (ví dụ: dựa trên tên hoặc mã sinh viên)
// Lưu ý: Backend cần có endpoint tương ứng, ví dụ /students/search?q=...
export const searchStudents = async (query) => {
    if (!query) return []; // Trả về mảng rỗng nếu query rỗng
    try {
        console.log(`Searching students with query: ${query}`);
        const response = await api.get(`/students/search`, { params: { q: query } });
        return response.data;
    } catch (error) {
        console.error('Error searching students:', error.response || error);
        // Có thể trả về mảng rỗng hoặc throw lỗi tùy vào cách muốn xử lý UI
        // throw new Error(error.response?.data?.error || 'Không thể tìm kiếm sinh viên');
        return []; 
    }
};