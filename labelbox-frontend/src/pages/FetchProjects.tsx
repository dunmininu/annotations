import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Button,
  Modal,
  TextField,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

interface Project {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

interface ProjectResponse {
  message: string | null;
  success: boolean;
  total: number;
  page_size: number;
  page_index: number;
  nb_pages: number;
  previous: string | null;
  next: string | null;
  data: Project[];
}

const FetchProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [prevPage, setPrevPage] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const navigate = useNavigate();

  const fetchProjects = async (url: string) => {
    const accessToken = sessionStorage.getItem('accessToken');

    if (!accessToken) {
      setError('Authentication token missing. Please log in again.');
      navigate('/login');
      return;
    }

    try {
      const response = await axiosInstance.get<ProjectResponse>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setProjects(response.data.data);
      setNextPage(response.data.next);
      setPrevPage(response.data.previous);
    } catch (err) {
      setError('Failed to fetch projects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects('/api/projects/?page_index=1&page_size=10');
  }, []);

  const handlePageChange = (url: string) => {
    setLoading(true);
    fetchProjects(url);
  };

  const handleProjectClick = (projectId: number) => {
    navigate(`/project-detail/${projectId}`);
  };

  const handleCreateProject = async () => {
    const accessToken = sessionStorage.getItem('accessToken');

    if (!accessToken) {
      setError('Authentication token missing. Please log in again.');
      navigate('/login');
      return;
    }

    try {
      const response = await axiosInstance.post<Project>(
        '/api/projects/',
        { ...newProject },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setProjects((prev) => [response.data, ...prev]);
      setOpenModal(false);
      setNewProject({ name: '', description: '' });
    } catch (err) {
      setError('Failed to create project. Please try again later.');
    }
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
    <Box sx={{ padding: '2rem' }}>
      <Typography variant="h4" gutterBottom>
        Projects
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenModal(true)}
        sx={{ marginBottom: '1rem' }}
      >
        Create New Project
      </Button>
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            p: 4,
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Create Project
          </Typography>
          <TextField
            fullWidth
            label="Name"
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            sx={{ marginBottom: '1rem' }}
          />
          <TextField
            fullWidth
            label="Description"
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            multiline
            rows={3}
            sx={{ marginBottom: '1rem' }}
          />
          <Button variant="contained" onClick={handleCreateProject}>
            Submit
          </Button>
        </Box>
      </Modal>
      {projects.length > 0 ? (
        <>
          <List>
            {projects.map((project) => (
              <ListItem
                key={project.id}
                button
                onClick={() => handleProjectClick(project.id)}
                sx={{
                  border: '1px solid',
                  borderColor: 'grey.300',
                  borderRadius: '4px',
                  marginBottom: '1rem',
                  padding: '1rem',
                }}
              >
                <ListItemText
                  primary={project.name}
                  secondary={`Created At: ${new Date(project.created_at).toLocaleDateString()}`}
                />
              </ListItem>
            ))}
          </List>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            {prevPage && (
              <Button variant="contained" onClick={() => handlePageChange(prevPage)}>
                Previous
              </Button>
            )}
            {nextPage && (
              <Button variant="contained" onClick={() => handlePageChange(nextPage)}>
                Next
              </Button>
            )}
          </Box>
        </>
      ) : (
        <Typography>No projects found.</Typography>
      )}
    </Box>
  );
};

export default FetchProjects;
