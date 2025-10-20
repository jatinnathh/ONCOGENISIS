import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile } from '../services/userService';
import type { Doctor } from '../types';
import './Dashboard.css';

const DoctorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const profileData = await getUserProfile(user.uid, 'doctor');
          setProfile(profileData as Doctor);
        } catch (error) {
          console.error('Error fetching profile:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfile();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Doctor Dashboard</h1>
          <span className="user-type-badge" style={{ backgroundColor: '#4CAF50' }}>
            👨‍⚕️ Doctor
          </span>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
      
      <div className="dashboard-content">
        <div className="welcome-card">
          <h2>Welcome, Dr. {profile?.name || 'Doctor'}!</h2>
          <p>You're successfully logged in to the doctor portal.</p>
        </div>

        <div className="profile-card">
          <h3>Doctor Profile</h3>
          <div className="profile-grid">
            <div className="profile-item">
              <strong>Doctor ID:</strong>
              <span>{profile?.doctorId || 'N/A'}</span>
            </div>
            
            <div className="profile-item">
              <strong>Name:</strong>
              <span>{profile?.name || 'N/A'}</span>
            </div>

            <div className="profile-item">
              <strong>Email:</strong>
              <span>{user?.email}</span>
            </div>
            
            <div className="profile-item">
              <strong>Specialization:</strong>
              <span>{profile?.specialization || 'N/A'}</span>
            </div>
            
            <div className="profile-item">
              <strong>Department:</strong>
              <span>{profile?.department || 'N/A'}</span>
            </div>
            
            <div className="profile-item">
              <strong>Phone:</strong>
              <span>{profile?.phone || 'N/A'}</span>
            </div>
            
            <div className="profile-item">
              <strong>Status:</strong>
              <span className={`status-badge ${profile?.status || 'active'}`}>
                {profile?.status || 'active'}
              </span>
            </div>
          </div>
        </div>

        <div className="info-card">
          <h3>Doctor Portal Features</h3>
          <p>Access patient records, manage appointments, and view your schedule from here.</p>
          <ul style={{ marginTop: '15px', paddingLeft: '20px', color: '#666' }}>
            <li>View and manage patient appointments</li>
            <li>Access medical records</li>
            <li>Update patient prescriptions</li>
            <li>View your schedule and availability</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;

