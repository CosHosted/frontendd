import { useState } from 'react';
import './AdminDashboard.css';

import {
    Box,
    Container,
    Typography,
    Paper,
    Tabs,
    Tab,
    Divider
} from '@mui/material';
import CreateUser from '../../components/admin/CreateUser';

const AdminDashboard = () => {
    const [currentTab, setCurrentTab] = useState(0);

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };
    
    return (
        <Container maxWidth="lg" className="adminDashboardContainer">
            <Paper elevation={0} className="adminDashboardPaper">
                <Typography variant="h4" component="h1" className="dashboardTitleAdmin">
                    Quản lý hệ thống
                </Typography>
                
                <Box className="tabsContainerAdmin">
                    <Tabs 
                        value={currentTab} 
                        onChange={handleTabChange}
                        aria-label="admin dashboard tabs"
                        className="adminDashboardTabs"
                    >
                        <Tab label="Tạo người dùng" className="adminDashboardTab" />
                        <Tab label="Quản lý người dùng" className="adminDashboardTab" />
                        <Tab label="Quản lý lớp học" className="adminDashboardTab" />
                    </Tabs>
                </Box>
        
                <Divider className="dashboardDividerAdmin" />

                <Box className="tabContentAdmin">
                    {currentTab === 0 && (
                         <CreateUser />
                        
                    )}

                    {currentTab === 1 && (
                        <Typography variant="body1">
                            Chức năng quản lý người dùng sẽ được hiển thị ở đây...
                        </Typography>
                    )}

                    {currentTab === 2 && (
                        <Typography variant="body1">
                            Chức năng quản lý lớp học sẽ được hiển thị ở đây...
                        </Typography>
                    )}
                </Box>
            </Paper>
        </Container>
    );
};

export default AdminDashboard; 