import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Button,
  Modal,
  TextField,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

// Define types in a separate interface file for better organization
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

// Custom hook to handle authentication
const useAuth = () => {
  const navigate = useNavigate();
  const accessToken = sessionStorage.getItem('accessToken');

  if (!accessToken) {
    navigate('/login');
    throw new Error('Authentication token missing. Please log in again.');
  }

  return accessToken;
};

const FetchProjects: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [pagination, setPagination] = React.useState<{next: string | null; prev: string | null}>({
    next: null,
    prev: null
  });
  const [modalState, setModalState] = React.useState({
    open: false,
    name: '',
    description: ''
  });

  // Fetch projects with error handling
  const fetchProjects = async (url: string) => {
    try {
      const accessToken = useAuth();
      const response = await axiosInstance.get<ProjectResponse>(url, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      setProjects(response.data.data);
      setPagination({
        next: response.data.next,
        prev: response.data.previous
      });
    } catch (err) {
      setError('Failed to fetch projects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Create new project with proper error handling
  const handleCreateProject = async () => {
    try {
      const accessToken = useAuth();
      const response = await axiosInstance.post<Project>(
        '/api/projects/',
        {
          name: modalState.name,
          description: modalState.description
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );

      setProjects(prev => [response.data, ...prev]);
      setModalState({ open: false, name: '', description: '' });
    } catch (err) {
      setError('Failed to create project. Please try again later.');
    }
  };

  React.useEffect(() => {
    fetchProjects('/api/projects/?page_index=1&page_size=10');
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" p={4}>
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
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Projects
      </Typography>
      
      <Button
        variant="contained"
        color="primary"
        onClick={() => setModalState(prev => ({ ...prev, open: true }))}
        sx={{ mb: 2 }}
      >
        Create New Project
      </Button>

      <Modal
        open={modalState.open}
        onClose={() => setModalState(prev => ({ ...prev, open: false }))}
      >
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
            width: '90%',
            maxWidth: 500
          }}
        >
          <Typography variant="h6" gutterBottom>
            Create Project
          </Typography>
          <TextField
            fullWidth
            label="Name"
            value={modalState.name}
            onChange={(e) => setModalState(prev => ({ ...prev, name: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={modalState.description}
            onChange={(e) => setModalState(prev => ({ ...prev, description: e.target.value }))}
            multiline
            rows={3}
            sx={{ mb: 2 }}
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
                disablePadding
                sx={{ mb: 2 }}
              >
                <ListItemButton
                  onClick={() => navigate(`/project-detail/${project.id}`)}
                  sx={{
                    border: '1px solid',
                    borderColor: 'grey.300',
                    borderRadius: 1,
                    p: 2
                  }}
                >
                  <ListItemText
                    primary={project.name}
                    secondary={`Created At: ${new Date(project.created_at).toLocaleDateString()}`}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          
          <Box display="flex" justifyContent="space-between">
            {pagination.prev && (
              <Button variant="contained" onClick={() => fetchProjects(pagination.prev!)}>
                Previous
              </Button>
            )}
            {pagination.next && (
              <Button variant="contained" onClick={() => fetchProjects(pagination.next!)}>
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