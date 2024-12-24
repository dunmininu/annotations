import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Divider,
  CircularProgress,
  Button,
} from '@mui/material';
import axiosInstance from '../axiosConfig';
import TaskCreation from '../components/TaskCreation';
import AnnotationCRUD from '../components/AnnotationCRUD';
import { useNavigate, useParams } from 'react-router-dom';

interface Project {
  id: number;
  name: string;
  description: string | null;
}

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const fetchProjectDetails = async () => {
    try {
      const accessToken = sessionStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Authentication token missing. Please log in again.');
      }

      const numericProjectId = Number(projectId);
      if (isNaN(numericProjectId)) {
        throw new Error('Invalid project ID.');
      }

      setLoading(true);
      const response = await axiosInstance.get(`/api/projects/${numericProjectId}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setProject(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch project details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', padding: '2rem' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading project details...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', padding: '2rem' }}>
        <Typography color="error" variant="h6" gutterBottom>
          {error}
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            navigate('/login');
          }}
        >
          Log in again
        </Button>
      </Box>
    );
  }

  if (!project) {
    return (
      <Box sx={{ textAlign: 'center', padding: '2rem' }}>
        <Typography variant="h6">Project not found</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        {project.name}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {project.description || 'No description provided.'}
      </Typography>
      <Divider sx={{ my: 2 }} />

      <Typography variant="h5" gutterBottom>
        Tasks
      </Typography>
      <TaskCreation projectId={String(project.id)} onTaskSelect={setSelectedTaskId} />

      {selectedTaskId && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h5" gutterBottom>
            Annotations for Task ID: {selectedTaskId}
          </Typography>
          <AnnotationCRUD taskId={selectedTaskId} />
        </>
      )}

      <Divider sx={{ my: 2 }} />
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Button
          variant="outlined"
          onClick={() => navigate(`/annotations/${selectedTaskId || ''}`)}
        >
          View All Annotations
        </Button>
      </Box>
    </Box>
  );
};

export default ProjectDetailPage;
