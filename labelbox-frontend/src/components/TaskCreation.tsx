import React from 'react';
import { 
  Box, 
  Button, 
  CircularProgress, 
  Typography, 
  List, 
  ListItem, 
  ListItemButton,
  ListItemText,
  Alert,
  styled 
} from '@mui/material';
import axiosInstance from '../axiosConfig';
import { useNavigate } from 'react-router-dom';

// Define our interfaces for better type safety
interface Task {
  id: string;
  url: string;
}

interface TaskResponse {
  message: string | null;
  success: boolean;
  total: number;
  page_size: number;
  page_index: number;
  nb_pages: number;
  previous: string | null;
  next: string | null;
  data: Task[];
}

interface TaskCreationProps {
  projectId: string;
  onTaskSelect: (taskId: string) => void;
}

// Create a styled input component for better file upload styling
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

// Custom hook for authentication
const useAuth = () => {
  const navigate = useNavigate();
  const accessToken = sessionStorage.getItem('accessToken');

  if (!accessToken) {
    navigate('/login');
    throw new Error('Authentication token missing. Please log in again.');
  }

  return accessToken;
};

// Custom hook to manage tasks state and operations
const useTasks = (projectId: string) => {
  const [state, setState] = React.useState<{
    tasks: Task[];
    loading: boolean;
    error: string | null;
  }>({
    tasks: [],
    loading: false,
    error: null,
  });

  const fetchTasks = React.useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const accessToken = useAuth();
      let allTasks: Task[] = [];
      let currentUrl: string | null = `/api/list-tasks/${projectId}?page=1`;

      while (currentUrl) {
        const response = await axiosInstance.get<TaskResponse>(currentUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const taskResponse: TaskResponse = response.data;
        allTasks = [...allTasks, ...taskResponse.data];
        currentUrl = taskResponse.next;
      }

      setState(prev => ({ 
        ...prev, 
        tasks: allTasks,
        loading: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch tasks',
        loading: false 
      }));
    }
  }, [projectId]);

  React.useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    ...state,
    addTask: (newTask: Task) => 
      setState(prev => ({ ...prev, tasks: [...prev.tasks, newTask] })),
    clearError: () => 
      setState(prev => ({ ...prev, error: null })),
  };
};

// Custom hook for file upload and task creation
const useTaskCreation = (projectId: string, onTaskSelect: (taskId: string) => void) => {
  const [uploadState, setUploadState] = React.useState<{
    uploading: boolean;
    error: string | null;
  }>({
    uploading: false,
    error: null
  });

  const handleFileUpload = async (file: File, addTask: (task: Task) => void) => {
    setUploadState({ uploading: true, error: null });

    try {
      const accessToken = useAuth();
      const formData = new FormData();
      formData.append('file', file);

      // Upload the image first
      const uploadResponse = await axiosInstance.post<string>(
        '/api/upload-image/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Create the task with the uploaded image URL
      const taskResponse = await axiosInstance.post<Task>(
        '/api/create-task/',
        {
          project_id: projectId,
          url: uploadResponse.data,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      addTask(taskResponse.data);
      onTaskSelect(taskResponse.data.id);
    } catch (error) {
      setUploadState({
        uploading: false,
        error: error instanceof Error ? error.message : 'Failed to create task'
      });
    } finally {
      setUploadState(prev => ({ ...prev, uploading: false }));
    }
  };

  return {
    ...uploadState,
    handleFileUpload,
    setError: (error: string | null) => 
      setUploadState(prev => ({ ...prev, error }))
  };
};

const TaskCreation: React.FC<TaskCreationProps> = ({ projectId, onTaskSelect }) => {
  const { tasks, loading, error: tasksError, addTask, clearError } = useTasks(projectId);
  const { 
    handleFileUpload, 
    uploading, 
    error: uploadError, 
    setError 
  } = useTaskCreation(projectId, onTaskSelect);

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    await handleFileUpload(file, addTask);
  };

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h5" gutterBottom>
        Create a Task
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Button
          variant="contained"
          component="label"
          disabled={uploading}
          sx={{ mb: 2 }}
        >
          {uploading ? 'Uploading...' : 'Upload Image'}
          <VisuallyHiddenInput
            type="file"
            accept="image/*"
            onChange={onFileChange}
          />
        </Button>

        {uploading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
            <CircularProgress size={20} />
            <Typography>Uploading image and creating task...</Typography>
          </Box>
        )}

        {(uploadError || tasksError) && (
          <Alert 
            severity="error" 
            onClose={clearError}
            sx={{ mt: 2 }}
          >
            {uploadError || tasksError}
          </Alert>
        )}
      </Box>

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Tasks
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : tasks.length > 0 ? (
        <List sx={{ width: '100%' }}>
          {tasks.map((task) => (
            <ListItem 
              key={task.id} 
              disablePadding
              sx={{ mb: 1 }}
            >
              <ListItemButton
                onClick={() => onTaskSelect(task.id)}
                sx={{
                  border: '1px solid',
                  borderColor: 'grey.300',
                  borderRadius: 1,
                  p: 2,
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body1" noWrap>
                      {task.url}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography color="text.secondary">
          No tasks available for this project.
        </Typography>
      )}
    </Box>
  );
};

export default TaskCreation;