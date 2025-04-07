import api from "../config/api";

export const login = async (username, password, role) => {
  try {
    const response = await api.post(`/auth/${role}/login`, {
      username,
      password,
    });
    const { data } = response;

    if (!data.token || !data.user) {
      throw new Error("Dữ liệu đăng nhập không hợp lệ");
    }

    // Lưu thông tin đăng nhập
    localStorage.setItem("token", data.token);
    localStorage.setItem("refreshToken", data.refreshToken || "");
    localStorage.setItem("userRole", data.user.role);
    localStorage.setItem("user", JSON.stringify(data.user));

    return {
      success: true,
      user: data.user,
      token: data.token,
    };
  } catch (error) {
    localStorage.clear();
    if (error.response) {
      throw new Error(error.response.data.message || "Đăng nhập thất bại");
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
