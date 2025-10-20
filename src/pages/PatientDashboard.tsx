import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile } from '../services/userService';
import type { Patient } from '../types';
import './Dashboard.css';

const PatientDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const profileData = await getUserProfile(user.uid, 'patient');
          setProfile(profileData as Patient);
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
          <h1>Patient Dashboard</h1>
          <span className="user-type-badge" style={{ backgroundColor: '#2196F3' }}>
            🏥 Patient
          </span>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
      
      <div className="dashboard-content">
        <div className="welcome-card">
          <h2>Welcome, {profile?.name || 'Patient'}!</h2>
          <p>You're successfully logged in to the patient portal.</p>
        </div>

        <div className="profile-card">
          <h3>Patient Profile</h3>
          <div className="profile-grid">
            <div className="profile-item">
              <strong>Patient ID:</strong>
              <span>{profile?.patientId || 'N/A'}</span>
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
              <strong>Phone:</strong>
              <span>{profile?.phone || 'N/A'}</span>
            </div>
            
            <div className="profile-item">
              <strong>Gender:</strong>
              <span>{profile?.gender || 'N/A'}</span>
            </div>
            
            <div className="profile-item">
              <strong>Date of Birth:</strong>
              <span>{profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
            </div>
            
            <div className="profile-item">
              <strong>Address:</strong>
              <span>{profile?.address || 'N/A'}</span>
            </div>
            
            <div className="profile-item">
              <strong>Emergency Contact:</strong>
              <span>{profile?.emergencyContact || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="info-card">
          <h3>Patient Portal Features</h3>
          <p>Book appointments, view your medical history, and manage your health records from here.</p>
          <ul style={{ marginTop: '15px', paddingLeft: '20px', color: '#666' }}>
            <li>Book and manage appointments</li>
            <li>View medical history and records</li>
            <li>Access prescriptions and lab results</li>
            <li>Contact your healthcare providers</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;

