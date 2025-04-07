import { useState } from 'react';
// Import CSS mới
import './TeacherDashboard.css'; 

import {
    Box,
    Container,
    Typography,
    Paper,
    Tabs,
    Tab,
    Divider
} from '@mui/material';

import CreateClass from '../../components/teacher/CreateClass';
import ClassList from '../../components/teacher/ClassList';
// Có thể cần import component Báo cáo điểm danh sau này
// import AttendanceReport from '../../components/teacher/AttendanceReport'; 

const TeacherDashboard = () => {
    const [currentTab, setCurrentTab] = useState(0); // Bắt đầu với tab Danh sách lớp học

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    return (
        // Thêm className vào Container, xóa sx mt, mb (đã có trong CSS)
        <Container maxWidth="lg" className="teacherDashboardContainer">
            {/* Thêm className vào Paper, xóa sx p */}
            <Paper elevation={0} /* Tắt elevation mặc định vì dùng box-shadow CSS */ className="teacherDashboardPaper">
                {/* Thêm className vào Typography, xóa sx gutterBottom */}
                <Typography variant="h4" component="h1" className="dashboardTitle">
                    Bảng điều khiển Giáo viên
                </Typography>
                
                {/* Thêm className vào Box chứa Tabs, xóa sx borderBottom, mb */}
                <Box className="tabsContainer">
                    <Tabs 
                        value={currentTab} 
                        onChange={handleTabChange}
                        aria-label="teacher dashboard tabs"
                        className="teacherDashboardTabs" // Class cho Tabs
                    >
                        {/* Thêm className cho từng Tab */}
                        <Tab label="Danh sách lớp học" className="teacherDashboardTab" />
                        <Tab label="Tạo lớp mới" className="teacherDashboardTab" />
                        {/* <Tab label="Tạo buổi học" /> Xóa tab này */}
                        <Tab label="Báo cáo điểm danh" className="teacherDashboardTab" />
                    </Tabs>
                </Box>

                {/* Thêm className cho Divider, xóa sx mb */}
                <Divider className="dashboardDivider" />

                {/* Vùng nội dung Tab */}
                <Box className="tabContent">
                    {currentTab === 0 && (
                        <ClassList />
                    )}

                    {currentTab === 1 && (
                        <CreateClass />
                    )}

                    {/* Xóa phần render cho tab đã xóa */}
                    {/* {currentTab === 2 && (
                        <CreateSchedule />
                    )} */}

                    {/* Cập nhật index cho tab Báo cáo điểm danh */}
                    {currentTab === 2 && (
                        <Typography variant="body1">
                            Chức năng xem báo cáo điểm danh sẽ được hiển thị ở đây...
                        </Typography>
                        // <AttendanceReport /> 
                    )}
                </Box>
            </Paper>
        </Container>
    );
};

export default TeacherDashboard; 