// components/SideNavigation.tsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, List, ListItemText, ListItemIcon, Drawer, Typography, ListItemButton } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import FolderIcon from '@mui/icons-material/Folder';
import CampaignIcon from '@mui/icons-material/Campaign';

interface NavLink {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navLinks: NavLink[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <HomeIcon /> },
  { label: 'Projects', path: '/fetch-projects', icon: <FolderIcon /> },
  { label: 'Annotations', path: '/annotations', icon: <CampaignIcon /> },
];

const SideNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ padding: '1rem', textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          My App
        </Typography>
      </Box>
      <List>
        {navLinks.map((link) => (
          <ListItemButton
            key={link.label}
            selected={location.pathname === link.path}
            onClick={() => navigate(link.path)}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                color: 'white',
                '& .MuiListItemIcon-root': { color: 'white' },
              },
            }}
          >
            <ListItemIcon>{link.icon}</ListItemIcon>
            <ListItemText primary={link.label} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
};

export default SideNavigation;
