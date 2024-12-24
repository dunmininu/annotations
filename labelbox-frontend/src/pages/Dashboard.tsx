import React, { useEffect, useState } from 'react';
import { Typography, Button, Box, CircularProgress, List, ListItem, ListItemText, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

interface RecentAnnotation {
  coordinates: string;
  labels: string;
  created_at: string;
}

interface MetricsResponse {
  total_projects: number;
  total_tasks: number;
  total_annotations: number;
  recent_annotations: RecentAnnotation[];
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchMetrics = async () => {
      const accessToken = sessionStorage.getItem('accessToken');

      if (!accessToken) {
        setError('Authentication token missing. Please log in again.');
        navigate('/login');
        return;
      }

      try {
        const response = await axiosInstance.get<MetricsResponse>('/api/metrics', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setMetrics(response.data);
      } catch (err) {
        setError('Failed to load metrics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('accessToken');
    navigate('/login');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', padding: '2rem' }}>
        <Typography color="error" variant="h6" gutterBottom>
          {error}
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, padding: '2rem' }}>
      {/* Header */}
      <Box
        sx={{
          backgroundColor: 'primary.main',
          color: 'white',
          padding: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h5">Dashboard</Typography>
        <Button variant="contained" color="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </Box>

      {/* Main Content */}
      <Box sx={{ marginTop: '2rem' }}>
        <Box sx={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Paper sx={{ flex: 1, padding: '1rem' }}>
            <Typography variant="h6" gutterBottom>
              Total Projects
            </Typography>
            <Typography variant="body1">{metrics?.total_projects}</Typography>
          </Paper>
          <Paper sx={{ flex: 1, padding: '1rem' }}>
            <Typography variant="h6" gutterBottom>
              Total Tasks
            </Typography>
            <Typography variant="body1">{metrics?.total_tasks}</Typography>
          </Paper>
          <Paper sx={{ flex: 1, padding: '1rem' }}>
            <Typography variant="h6" gutterBottom>
              Total Annotations
            </Typography>
            <Typography variant="body1">{metrics?.total_annotations}</Typography>
          </Paper>
        </Box>

        <Box sx={{ marginTop: '2rem' }}>
          <Typography variant="h6" gutterBottom>
            Recent Annotations
          </Typography>
          {metrics?.recent_annotations.length ? (
            <List>
              {metrics.recent_annotations.map((annotation, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={`Coordinates: ${annotation.coordinates}, Labels: ${annotation.labels}`}
                    secondary={`Created at: ${annotation.created_at}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>No recent annotations found.</Typography>
          )}
        </Box>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          backgroundColor: 'grey.800',
          color: 'white',
          textAlign: 'center',
          padding: '1rem',
          marginTop: 'auto',
        }}
      >
        <Typography variant="body2">© Oluwaseyi Alaka 2024 Your Application. All rights reserved.</Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;
