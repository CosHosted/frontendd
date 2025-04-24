import { useState } from 'react';
import './TeacherDashboard.css';
import {
    Box,
    Container,
    Typography,
    Paper,
    List,
    ListItemButton,
    ListItemText,
    Stack,
    CssBaseline,
    Button,
    Divider
} from '@mui/material';
import ClassList from '../../components/teacher/ClassList';
import CreateClass from '../../components/teacher/CreateClass';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';

const TeacherDashboard = () => {
    const [currentSection, setCurrentSection] = useState('manageClasses');

    const renderContent = () => {
        switch (currentSection) {
            case 'createClass':
                return (
                    <>
                        <CreateClass />
                        <Divider sx={{ my: 4 }} />
                    </>
                );
            case 'manageClasses':
                return (
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                Danh sách lớp học
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={() => setCurrentSection('createClass')}
                            >
                                Tạo lớp mới
                            </Button>
                        </Box>
                        <ClassList />
                    </Box>
                );
            case 'attendanceReports':
                return (
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                            Báo cáo điểm danh
                        </Typography>
                        <Typography color="text.secondary">
                            Tính năng đang được phát triển...
                        </Typography>
                    </Box>
                );
            default:
                return null;
        }
    };

    const menuItems = [
        { label: '📚 Danh sách lớp học', section: 'manageClasses' },
        { label: '📊 Báo cáo điểm danh', section: 'attendanceReports' }
    ];

    return (
        <Container maxWidth="xl" className="teacherDashboardContainer">
     
            <Typography variant="h4" className="dashboardTitle" sx={{ fontWeight: 700, color: 'primary.main' }}>
                Bảng điều khiển giáo viên
            </Typography>
            <Typography variant="body1" className="dashboardSubtitle" sx={{ mb: 4, color: 'text.secondary' }}>
                Quản lý lớp học và điểm danh sinh viên  
            </Typography>
            <CssBaseline />
            <Stack direction="row" className="sidebarContainer">
                {/* Sidebar Navigation */}
                <Paper className="sidebar">
                    <Typography variant="h6" sx={{ p: 2, fontWeight: 700, color: 'primary.main' }}>
                        Bảng điều khiển
                    </Typography>
                    <List component="nav">
                        {menuItems.map((item) => (
                            <ListItemButton
                                key={item.section}
                                selected={currentSection === item.section}
                                onClick={() => setCurrentSection(item.section)}
                                className={`sidebarItem ${currentSection === item.section ? 'active' : ''}`}
                            >
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{
                                        variant: 'body1',
                                        fontWeight: currentSection === item.section ? 600 : 500
                                    }}
                                />
                            </ListItemButton>
                        ))}
                    </List>
                </Paper>

                {/* Main Content Area */}
                <Paper className="contentArea">
                    {renderContent()}
                </Paper>
            </Stack>
        </Container>
    );
};

export default TeacherDashboard;