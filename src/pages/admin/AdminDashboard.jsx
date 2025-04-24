import { useState } from "react";
import "./AdminDashboard.css";

import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  Button,
} from "@mui/material";
import WavingHandIcon from '@mui/icons-material/WavingHand';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import ClassIcon from '@mui/icons-material/Class';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CreateUser from "../../components/admin/CreateUser";
import BulkCreateUsers from "../../components/admin/BulkCreateUsers";

const AdminDashboard = () => {
  const [currentSection, setCurrentSection] = useState("manageUsers");

  const renderContent = () => {
    switch (currentSection) {
      case "createUser":
        return (
          <>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setCurrentSection("manageUsers")}
             
            >
              <ArrowBackIcon />
              Quay lại
            </Button>
            <CreateUser />
            <Divider sx={{ my: 4 }} />
            <BulkCreateUsers />
          </>
        );
      case "manageUsers":
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Quản lý người dùng
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setCurrentSection("createUser")}
              >
                Thêm người dùng mới
              </Button>
            </Box>
            <Typography variant="body1">
              Chức năng quản lý người dùng sẽ được hiển thị ở đây...
            </Typography>
          </Box>
        );
      case "manageClasses":
        return (
          <Typography variant="body1">
            Chức năng quản lý lớp học sẽ được hiển thị ở đây...
          </Typography>
        );
      default:
        return null;
    }
  };

  return (
    <div className="adminDashboardBackground">
        <Typography 
          variant="h4" 
          className="adminDashboardTitle"
          sx={{ color: '#1e88e5', fontWeight: 'bold', mb: 2 }}
        >
          Hệ thống điểm danh
        </Typography>
    <Box className="adminDashboardContainer">
      <Box className="sidebarMenu">
        <Typography variant="h6" className="sidebarTitle" gutterBottom>
          Menu
        </Typography>
        <ul className="sidebarMenuList">
          <li
            className={`sidebarMenuItem ${
              currentSection === "manageUsers" ? "active" : ""
            }`}
            onClick={() => setCurrentSection("manageUsers")}
          >
            <GroupIcon style={{ marginRight: '8px' }} /> Quản lý người dùng
          </li>
          <Divider/>
          <li
            className={`sidebarMenuItem ${
              currentSection === "manageClasses" ? "active" : ""
            }`}
            onClick={() => setCurrentSection("manageClasses")}
          >
            <ClassIcon style={{ marginRight: '8px' }} /> Quản lý lớp học
          </li>
        </ul>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" className="mainContent">
        <Typography variant="h6" className="mainContentTitle">
          Welcome back, Admin <WavingHandIcon fontSize="small" style={{ color: '#FFA500' }} />
        </Typography>
        <Paper elevation={0} className="adminDashboardPaper">
          <Typography
            variant="h4"
            component="h1"
            className="dashboardTitleAdmin"
          >
            Bảng điều khiển quản trị viên
          </Typography>

          <Divider className="dashboardDividerAdmin" />

          <Box className="tabContentAdmin">{renderContent()}</Box>
        </Paper>
      </Container>
    </Box>
    </div>
  );
};

export default AdminDashboard;
