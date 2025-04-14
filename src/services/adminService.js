import api from '../config/api';

export const createUser = async (userData) => {
    try {
        const response = await api.post('/admin/users', userData);
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.error || 'Không thể tạo người dùng');
        }
        throw new Error('Không thể kết nối đến server');
    }
};

export const getUsers = async () => {
    try {
        const response = await api.get('/admin/users');
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.error || 'Không thể lấy danh sách người dùng');
        }
        throw new Error('Không thể kết nối đến server');
    }
}; 
export const uploadUsers = async (formData) => {
    try {
        // Endpoint phải khớp với route đã định nghĩa ở backend
        const response = await api.post('/admin/users/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Quan trọng cho file upload
            },
            timeout: 120000 // Tăng timeout 
        });
        return response.data; // Trả về dữ liệu từ backend (thường là message)
    } catch (error) {
        console.error('Error uploading users:', error.response || error);
        // Nếu lỗi là timeout, cung cấp thông báo rõ ràng hơn
        if (error.code === 'ECONNABORTED') {
            throw new Error('Request timed out after 60 seconds. The server might be busy processing the file. Please check again later or try a smaller file.');
        }
        throw error; // Ném lỗi gốc để component xử lý
    }
};