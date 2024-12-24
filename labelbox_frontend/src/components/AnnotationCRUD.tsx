import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Modal,
  List,
  ListItem,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axiosInstance from '../axiosConfig';

interface Annotation {
  id?: number;
  task_id: number;
  coordinates: string | null;
  labels: string | null;
  data: Record<string, any> | null;
}

const AnnotationCRUD: React.FC<{ taskId: string }> = ({ taskId }) => {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const accessToken = sessionStorage.getItem('accessToken');

  // Fetch annotations for the given task
  const fetchAnnotations = async () => {
    try {
        const response = await axiosInstance.get(`/api/list-annotations/${taskId}/`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            },
      });
      setAnnotations(response.data);
    } catch (error) {
      console.error('Error fetching annotations:', error);
    }
  };

  // Open the modal for creating a new annotation
  const handleCreateNew = () => {
    setCurrentAnnotation({ task_id: parseInt(taskId), coordinates: '', labels: '', data: {} });
    setOpenModal(true);
  };

  // Open the modal for editing an annotation
  const handleEdit = (annotation: Annotation) => {
    setCurrentAnnotation(annotation);
    setOpenModal(true);
  };

  // Submit the form to create or update an annotation
  const handleSubmit = async () => {
    if (!currentAnnotation) return;

    try {
      const endpoint = currentAnnotation.id
        ? `/api/update-annotation/${currentAnnotation.id}/`
        : '/api/create-annotation/';
      const method = currentAnnotation.id ? 'put' : 'post';

      await axiosInstance[method](endpoint, currentAnnotation, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            },
      });

      fetchAnnotations();
      setOpenModal(false);
    } catch (error) {
      console.error('Error saving annotation:', error);
    }
  };

  // Delete an annotation
  const handleDelete = async (annotationId: number) => {
    if (!window.confirm('Are you sure you want to delete this annotation?')) return;

    try {
        await axiosInstance.delete(`/api/delete-annotation/${annotationId}/`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                },
      });
      fetchAnnotations();
    } catch (error) {
      console.error('Error deleting annotation:', error);
    }
  };

  // Fetch annotations when the component mounts or taskId changes
  useEffect(() => {
    fetchAnnotations();
  }, [taskId]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Annotations
      </Typography>
      <Button variant="contained" color="primary" onClick={handleCreateNew}>
        Create Annotation
      </Button>

      <List>
        {annotations.map((annotation) => (
          <ListItem key={annotation.id} divider>
            <Box flex="1">
              <Typography variant="body1">
                <strong>Coordinates:</strong> {annotation.coordinates || 'N/A'}
              </Typography>
              <Typography variant="body1">
                <strong>Labels:</strong> {annotation.labels || 'N/A'}
              </Typography>
              <Typography variant="body1">
                <strong>Data:</strong> {JSON.stringify(annotation.data, null, 2) || 'N/A'}
              </Typography>
            </Box>
            <IconButton onClick={() => handleEdit(annotation)} color="primary">
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => handleDelete(annotation.id!)} color="secondary">
              <DeleteIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>

      {/* Modal for creating/updating annotations */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          p={3}
          bgcolor="background.paper"
          style={{ width: 400, margin: 'auto', marginTop: '10%' }}
        >
          <Typography variant="h6" gutterBottom>
            {currentAnnotation?.id ? 'Edit Annotation' : 'Create Annotation'}
          </Typography>
          <TextField
            label="Coordinates"
            fullWidth
            margin="normal"
            value={currentAnnotation?.coordinates || ''}
            onChange={(e) =>
              setCurrentAnnotation({ ...currentAnnotation!, coordinates: e.target.value })
            }
          />
          <TextField
            label="Labels"
            fullWidth
            margin="normal"
            value={currentAnnotation?.labels || ''}
            onChange={(e) =>
              setCurrentAnnotation({ ...currentAnnotation!, labels: e.target.value })
            }
          />
          <TextField
            label="Data (JSON)"
            fullWidth
            margin="normal"
            value={JSON.stringify(currentAnnotation?.data || {})}
            onChange={(e) => {
              try {
                setCurrentAnnotation({
                  ...currentAnnotation!,
                  data: JSON.parse(e.target.value),
                });
              } catch {
                console.error('Invalid JSON input');
              }
            }}
          />
          <Button variant="contained" color="primary" onClick={handleSubmit} fullWidth>
            Submit
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default AnnotationCRUD;
