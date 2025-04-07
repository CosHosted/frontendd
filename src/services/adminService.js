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