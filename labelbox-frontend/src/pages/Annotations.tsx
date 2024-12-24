import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

interface Annotation {
  id: string;
  coordinates: string;
  labels: string;
  created_at: string;
}

const Annotations: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get('taskId');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchAnnotations = async () => {
      try {
        const accessToken = sessionStorage.getItem('accessToken');
        if (!accessToken) {
          throw new Error('Authentication token missing. Please log in again.');
        }

        const url = taskId
          ? `/api/list-annotations/?taskId=${taskId}`
          : '/api/list-annotations/';
        const response = await axiosInstance.get<Annotation[]>(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setAnnotations(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load annotations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnotations();
  }, [taskId]);

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
        <Button variant="contained" onClick={() => navigate('/login')}>
          Log in again
        </Button>
      </Box>
    );
  }

  return (
    <Container>
      <Box sx={{ marginTop: '2rem' }}>
        <Typography variant="h4" gutterBottom>
          Annotations {taskId && `for Task ID: ${taskId}`}
        </Typography>
        {annotations.length ? (
          <List>
            {annotations.map((annotation) => (
              <ListItem
                key={annotation.id}
                button
                onClick={() => navigate(`/annotations/${annotation.id}`)}
              >
                <ListItemText
                  primary={`Labels: ${annotation.labels}`}
                  secondary={`Created at: ${annotation.created_at}`}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>No annotations found.</Typography>
        )}
      </Box>
    </Container>
  );
};

export default Annotations;
