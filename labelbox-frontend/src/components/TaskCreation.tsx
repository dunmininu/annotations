import React, { useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Typography, List, ListItem, ListItemText } from '@mui/material';
import axiosInstance from '../axiosConfig';
import { useNavigate } from 'react-router-dom';

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

const TaskCreation: React.FC<TaskCreationProps> = ({ projectId, onTaskSelect }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const navigate = useNavigate();

  const fetchTasks = async () => {
    setLoadingTasks(true);
    const accessToken = sessionStorage.getItem('accessToken');
    if (!accessToken) {
      setError('Authentication token missing. Please log in again.');
      navigate('/login');
      return;
    }

    try {
      let page = 1;
      let allTasks: Task[] = [];
      let nextPage: string | null = `/api/list-tasks/${projectId}?page=${page}`;

      while (nextPage) {
        const response = await axiosInstance.get<TaskResponse>(nextPage, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const { data, next } = response.data;
        allTasks = [...allTasks, ...data];
        nextPage = next;
        page += 1;
      }

      setTasks(allTasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to fetch tasks. Please try again.');
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId, navigate]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const accessToken = sessionStorage.getItem('accessToken');
    const file = event.target.files?.[0];
    if (!file) return;

    if (!accessToken) {
      setError('Authentication token missing. Please log in again.');
      navigate('/login');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await axiosInstance.post('/api/upload-image/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const uploadedUrl = uploadResponse.data;

      const taskResponse = await axiosInstance.post('/api/create-task/', {
        project_id: projectId,
        url: uploadedUrl,
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const createdTask = taskResponse.data;

      setTasks((prevTasks) => [...prevTasks, createdTask]);
      onTaskSelect(createdTask.id);
    } catch (err) {
      console.error('Error during file upload or task creation:', err);
      setError('Failed to upload file or create task. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Create a Task
      </Typography>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        disabled={uploading}
        style={{ marginBottom: '1rem' }}
      />
      {uploading && <CircularProgress />}
      {error && (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )}
      <Button variant="contained" component="label" disabled={uploading}>
        Upload and Create Task
        <input type="file" hidden onChange={handleFileUpload} />
      </Button>
      <Typography variant="h6" gutterBottom sx={{ marginTop: '2rem' }}>
        Tasks
      </Typography>
      {loadingTasks ? (
        <CircularProgress />
      ) : tasks.length > 0 ? (
        <List>
          {tasks.map((task) => (
            <ListItem key={task.id} button onClick={() => onTaskSelect(task.id)}>
              <ListItemText primary={task.url} />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2">No tasks available for this project.</Typography>
      )}
    </Box>
  );
};

export default TaskCreation;
