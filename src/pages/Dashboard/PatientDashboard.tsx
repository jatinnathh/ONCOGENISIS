import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserProfile } from '../../services/userService';
import type { Patient } from '../../types';
import './PatientDashboard.css';

const PatientDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State for sidebar collapse

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

  // Handler for sidebar toggle
  const handleToggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  const mainLayoutClass = `dashboard-main-layout ${isSidebarOpen ? '' : 'sidebar-collapsed'}`;

  // Helper to extract first name for a friendlier welcome message
  const firstName = profile?.name ? profile.name.split(' ')[0] : 'Patient';

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Patient Dashboard</h1>
          <span className="user-type-badge" style={{ backgroundColor: '#2196F3' }}>
            🏥 Patient
          </span>
        </div>
        <div className="header-right">
          <span className="welcome-message">Welcome, {firstName}!</span>
          <button className="logout-button-header" onClick={handleLogout}>
             Logout
          </button>
        </div>
      </div>
      
      <div className={mainLayoutClass}>
        
        {/* START: Sidebar Wrapper */}
        <div className="sidebar-wrapper">
            {/* Collapse/Expand Button */}
            <button className="sidebar-toggle-button" onClick={handleToggleSidebar}>
                <i 
                    className={`fas ${isSidebarOpen ? 'fa-angle-left' : 'fa-angle-right'}`}
                    title={isSidebarOpen ? 'Collapse Menu' : 'Expand Menu'}
                ></i>
                {isSidebarOpen && <span className="toggle-text">Collapse Menu</span>}
            </button>

            {/* Sidebar Navigation */}
            <div className="dashboard-nav">
              <nav>
                <button 
                  className="nav-button active" // Set 'active' for the current view
                  onClick={() => handleNavigate('/dashboard')} 
                >
                  <i className="fas fa-home"></i> 
                  {isSidebarOpen && <span>Dashboard Home</span>}
                </button>
                
                <button 
                  className="nav-button" 
                  onClick={() => handleNavigate('/history')}
                >
                  <i className="fas fa-history"></i> 
                  {isSidebarOpen && <span>Visit History</span>}
                </button>

                <button 
                  className="nav-button" 
                  onClick={() => handleNavigate('/records')}
                >
                  <i className="fas fa-folder-open"></i> 
                  {isSidebarOpen && <span>My Records</span>}
                </button>

                <button 
                  className="nav-button" 
                  onClick={() => handleNavigate('/prescriptions')}
                >
                  <i className="fas fa-file-prescription"></i> 
                  {isSidebarOpen && <span>Prescriptions</span>}
                </button>

                <button 
                  className="nav-button" 
                  onClick={() => handleNavigate('/appointments')}
                >
                  <i className="fas fa-calendar-alt"></i> 
                  {isSidebarOpen && <span>Upcoming Meets</span>}
                </button>

                <button className="nav-button logout-button" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i> 
                  {isSidebarOpen && <span>Logout</span>}
                </button>
              </nav>
            </div>
        </div>
        {/* END: Sidebar Wrapper */}

        {/* START: Main Content */}
        <div className="dashboard-content">
          <div className="welcome-card">
            <h2>Portal Overview</h2>
            <p>You're successfully logged in to the patient portal. Use the menu on the left to navigate your health data.</p>
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
            <h3>Quick Actions</h3>
            <p>Ready to manage your health? Click on an item in the sidebar to get started.</p>
            <ul style={{ marginTop: '15px', paddingLeft: '20px', color: '#666' }}>
              <li>**Visit History**: Review past appointments and visit notes.</li>
              <li>**Prescriptions**: Check your active and past medication lists.</li>
              <li>**Upcoming Meets**: Schedule or confirm your future appointments.</li>
            </ul>
          </div>
        </div>
        {/* END: Main Content */}
      </div>
    </div>
  );
};

export default PatientDashboard;