import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserProfile } from '../../services/userService';
import type { Patient } from '../../types';

// --- Doctor Card Imports and Mock Data ---
import { DoctorList } from '../../components/viewCards/DoctorCard'; 

interface Doctor {
  id: number;
  name: string;
  qualification: string;
  specialty: string;
  expertise: string;
  experienceYears: number;
  photoUrl: string;
  availableSlots: string[]; // Crucial for time slots
}

const MOCK_DOCTORS: Doctor[] = [
  {
    id: 101,
    name: 'Aisha Khan',
    qualification: 'MD, FRCP (Cardiology)',
    specialty: 'Cardiology',
    expertise: 'Interventional Cardiology, ECG',
    experienceYears: 12,
    photoUrl: 'https://i.pravatar.cc/150?img=40',
    availableSlots: ['9:00 - 10:00', '10:00 - 12:00', '1:00 - 2:00']
  },
  {
    id: 102,
    name: 'Rajesh Sharma',
    qualification: 'MBBS, MS (Orthopaedics)',
    specialty: 'Orthopaedics',
    expertise: 'Joint Replacement, Sports',
    experienceYears: 5,
    photoUrl: 'https://i.pravatar.cc/150?img=68',
    availableSlots: ['9:00 - 10:00', '10:00 - 12:00', '1:00 - 2:00']
  },
  {
    id: 103,
    name: 'Sarah Chen',
    qualification: 'Dermatology, PhD',
    specialty: 'Dermatology',
    expertise: 'Cosmetic Procedures',
    experienceYears: 7,
    photoUrl: 'https://i.pravatar.cc/150?img=26',
    availableSlots: ['11:00 - 12:00', '1:00 - 2:00'] // Different slots for variety
  }
];
// --- End Doctor Card Imports and Mock Data ---


import './PatientDashboard.css';

const PatientDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

  // Handler for the Doctor Card slot button click
  const handleSlotSelection = (doctorId: number, timeSlot: string) => {
    console.log(`Booking request: Doctor ID ${doctorId} at ${timeSlot}`);
    // Navigates to a confirmation page with data encoded in the URL
    navigate(`/book-appointment/confirm?doctorId=${doctorId}&slot=${encodeURIComponent(timeSlot)}`);
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  const mainLayoutClass = `dashboard-main-layout ${isSidebarOpen ? '' : 'sidebar-collapsed'}`;
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
                  className="nav-button active"
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
          {/* Doctor Card Integration */}
          <div className="info-card doctor-list-card">
            <h3>My Healthcare Team</h3>
            <p>Quickly book an appointment or view details for your primary care providers by selecting an available slot.</p>
            
            <div className="doctor-list-container-override">
                <DoctorList 
                    doctors={MOCK_DOCTORS} 
                    onSlotClick={handleSlotSelection}
                />
            </div>
          </div>

        </div>
        {/* END: Main Content */}
      </div>
    </div>
  );
};

export default PatientDashboard;