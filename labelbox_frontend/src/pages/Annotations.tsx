import React from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

// Define types in a separate block for better organization
interface Annotation {
  id: string;
  coordinates: string;
  labels: string;
  created_at: string;
}

interface ApiResponse {
  data: Annotation[];
  message?: string;
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

// Custom hook to fetch annotations
const useAnnotations = (taskId: string | null) => {
  const [state, setState] = React.useState<{
    annotations: Annotation[];
    loading: boolean;
    error: string;
  }>({
    annotations: [],
    loading: true,
    error: '',
  });

  React.useEffect(() => {
    const fetchAnnotations = async () => {
      try {
        const accessToken = useAuth();
        const url = taskId
          ? `/api/list-annotations/?taskId=${taskId}`
          : '/api/list-annotations/';

        const response = await axiosInstance.get<ApiResponse>(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        setState(prev => ({
          ...prev,
          annotations: response.data.data,
          loading: false,
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to load annotations',
          loading: false,
        }));
      }
    };

    fetchAnnotations();
  }, [taskId]);

  return state;
};

// Format date string in a consistent way
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const Annotations: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get('taskId');
  
  // Use custom hook to manage annotations state
  const { annotations, loading, error } = useAnnotations(taskId);

  // Loading state with centered spinner
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Error state with retry option
  if (error) {
    return (
      <Box textAlign="center" p={4}>
        <Typography color="error" variant="h6" gutterBottom>
          {error}
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/login')}
          sx={{ mt: 2 }}
        >
          Log in again
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Annotations {taskId && `for Task ID: ${taskId}`}
        </Typography>

        {annotations.length > 0 ? (
          <List sx={{ width: '100%' }}>
            {annotations.map((annotation) => (
              <ListItem
                key={annotation.id}
                disablePadding
                sx={{ mb: 2 }}
              >
                <ListItemButton
                  onClick={() => navigate(`/annotations/${annotation.id}`)}
                  sx={{
                    border: '1px solid',
                    borderColor: 'grey.300',
                    borderRadius: 1,
                    p: 2,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1">
                        Labels: {annotation.labels}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        Created at: {formatDate(annotation.created_at)}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body1" color="text.secondary">
            No annotations found.
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default Annotations;