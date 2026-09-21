import React, { useState } from 'react';
import AdminDashboard from './pages/admin/AdminDashboard';
import Login from './pages/Login';
import { AuthProvider } from './context/AuthContext';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleLoginSuccess = () => {
    setToken(localStorage.getItem('token'));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
  };

  return (
    <AuthProvider>
      {!token ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <AdminDashboard onLogout={handleLogout} />
      )}
    </AuthProvider>
  );
}

export default App;