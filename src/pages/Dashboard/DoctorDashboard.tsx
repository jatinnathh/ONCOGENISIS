import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserProfile } from '../../services/userService';
import type { Doctor } from '../../types';
import './Dashboard.css';

const DoctorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
  const firstName = profile?.name ? profile.name.split(' ')[0] : 'Doctor';

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Doctor Dashboard</h1>
          <span className="user-type-badge" style={{ backgroundColor: '#4CAF50' }}>
            👨‍⚕️ Doctor
          </span>
        </div>
        <div className="header-right">
          <span className="welcome-message">Welcome, Dr. {firstName}!</span>
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
                className="nav-button active"
                onClick={() => handleNavigate('/doctor/dashboard')} 
              >
                <i className="fas fa-home"></i> 
                {isSidebarOpen && <span>Dashboard Home</span>}
              </button>
              
              <button 
                className="nav-button" 
                onClick={() => handleNavigate('/doctor/patients')}
              >
                <i className="fas fa-users"></i> 
                {isSidebarOpen && <span>My Patients</span>}
              </button>

              <button 
                className="nav-button" 
                onClick={() => handleNavigate('/doctor/appointments')}
              >
                <i className="fas fa-calendar-check"></i> 
                {isSidebarOpen && <span>Appointments</span>}
              </button>

              <button 
                className="nav-button" 
                onClick={() => handleNavigate('/doctor/schedule')}
              >
                <i className="fas fa-clock"></i> 
                {isSidebarOpen && <span>My Schedule</span>}
              </button>

              <button 
                className="nav-button" 
                onClick={() => handleNavigate('/doctor/consultations')}
              >
                <i className="fas fa-stethoscope"></i> 
                {isSidebarOpen && <span>Consultations</span>}
              </button>

              <button 
                className="nav-button" 
                onClick={() => handleNavigate('/doctor/prescriptions')}
              >
                <i className="fas fa-prescription"></i> 
                {isSidebarOpen && <span>Prescriptions</span>}
              </button>

              <button 
                className="nav-button" 
                onClick={() => handleNavigate('/doctor/reports')}
              >
                <i className="fas fa-file-medical"></i> 
                {isSidebarOpen && <span>Medical Reports</span>}
              </button>

              <button 
                className="nav-button" 
                onClick={() => handleNavigate('/doctor/analytics')}
              >
                <i className="fas fa-chart-line"></i> 
                {isSidebarOpen && <span>Analytics</span>}
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
            <p>Welcome to your doctor portal. Use the menu on the left to manage patients, appointments, and medical records efficiently.</p>
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
            <h3>Quick Actions</h3>
            <p>Manage your medical practice efficiently with these features:</p>
            <ul style={{ marginTop: '15px', paddingLeft: '20px', color: '#666' }}>
              <li><strong>My Patients</strong>: View and manage your patient list with complete medical histories.</li>
              <li><strong>Appointments</strong>: Review today's appointments and upcoming consultations.</li>
              <li><strong>Prescriptions</strong>: Create and manage patient prescriptions digitally.</li>
              <li><strong>Analytics</strong>: Track your performance metrics and patient outcomes.</li>
            </ul>
          </div>
        </div>
        {/* END: Main Content */}
      </div>
    </div>
  );
};

export default DoctorDashboard;