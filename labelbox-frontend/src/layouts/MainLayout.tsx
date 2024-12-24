import React from 'react';
import { Box } from '@mui/material';
import SideNavigation from '../components/SideNavigation';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <SideNavigation />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;