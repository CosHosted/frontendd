import api from "../config/api";

export const login = async (username, password, role) => {
  try {
    console.log(`Đang đăng nhập với vai trò: ${role}, username: ${username}`);
    
    const response = await api.post(`/auth/${role}/login`, {
      username,
      password,
    });
    
    console.log("Phản hồi từ server:", response.status);
    const { data } = response;

    if (!data.token || !data.user) {
      console.error("Dữ liệu đăng nhập không hợp lệ:", data);
      throw new Error("Dữ liệu đăng nhập không hợp lệ");
    }

    // Lưu thông tin đăng nhập
    localStorage.setItem("token", data.token);
    localStorage.setItem("refreshToken", data.refreshToken || "");
    localStorage.setItem("userRole", data.user.role);
    localStorage.setItem("user", JSON.stringify(data.user));
    
    console.log("Đăng nhập thành công, đã lưu thông tin người dùng:", data.user.role);

    return {
      success: true,
      user: data.user,
      token: data.token,
    };
  } catch (error) {
    console.error("Lỗi trong quá trình đăng nhập:", error);
    localStorage.clear();
    
    if (error.response) {
      console.error("Lỗi từ server:", error.response.status, error.response.data);
      throw new Error(error.response.data.message || error.response.data.error || "Đăng nhập thất bại");
    }
    
    throw new Error("Không thể kết nối đến server");
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userRole");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

const authService = {
  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  getToken: () => {
    return localStorage.getItem("token");
  },

  getUserRole: () => {
    return localStorage.getItem("userRole");
  },

  validateToken: async () => {
    const response = await api.get("/auth/validate");
    return response.data;
  },
};

export default authService;
