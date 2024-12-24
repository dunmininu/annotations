import React, { useState } from 'react';
import { TextField, Button, Typography } from '@mui/material';
import Container  from '@mui/material/Container';
import axiosInstance from '../axiosConfig';
import { useNavigate } from 'react-router-dom';

interface LoginProps { }

const Login: React.FC<LoginProps> = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axiosInstance.post('/api/token/pair', { username, password });
      console.log('Login successful:', response.data);

      const { access, refresh } = response.data;
      sessionStorage.setItem('accessToken', access);
      sessionStorage.setItem('refreshToken', refresh);

      setError('');

      navigate('/dashboard');

    } catch (err) {
      console.error(err);
      setError('Invalid Username or password');
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError('');
  };

  return (
    <Container maxWidth="sm">
        <Typography variant="h4" gutterBottom>
            Login
        </Typography>
        {error && <Typography color="error">{error}</Typography>}
        <TextField
            fullWidth
            label="Username"
            margin="normal"
            value={username}
            onChange={handleUsernameChange}
        />
        <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            value={password}
            onChange={handlePasswordChange}
        />
        <Button variant="contained" color="primary" onClick={handleLogin}>
            Login
        </Button>
      </Container>
  );
};

export default Login;
