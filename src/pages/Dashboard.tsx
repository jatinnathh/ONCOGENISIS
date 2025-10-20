import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
      
      <div className="dashboard-content">
        <div className="welcome-card">
          <h2>Welcome!</h2>
          <p>You're successfully logged in.</p>
          {user?.email && (
            <p className="user-email">
              <strong>Email:</strong> {user.email}
            </p>
          )}
        </div>

        <div className="info-card">
          <h3>Start Building</h3>
          <p>This is your dashboard. You can now add your application features here.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

