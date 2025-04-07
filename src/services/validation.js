export const validateLogin = (values) => {
    const errors = {};
    
    if (!values.username) {
        errors.username = 'Vui lòng nhập tên đăng nhập';
    }
    
    if (!values.password) {
        errors.password = 'Vui lòng nhập mật khẩu';
    } else if (values.password.length < 6) {
        errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    return errors;
};

export const validateProfile = (values) => {
    const errors = {};
    
    if (!values.name) {
        errors.name = 'Vui lòng nhập họ tên';
    }
    
    if (!values.email) {
        errors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
        errors.email = 'Email không hợp lệ';
    }
    
    if (values.phoneNumber && !/^[0-9]{10}$/.test(values.phoneNumber)) {
        errors.phoneNumber = 'Số điện thoại không hợp lệ';
    }
    
    return errors;
};