import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserProfile } from '../../services/userService';
import type { Patient } from '../../types';
import { DoctorList, type Doctor as DoctorType } from '../../components/viewCards/DoctorCard';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import './PatientDashboard.css';

const PatientDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<DoctorType[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Fetch patient profile
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

  // Fetch doctors from Firestore
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'doctors'));
        const doctorList: DoctorType[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          
          return {
            id: doc.id,
            doctorId: data.doctorId || doc.id,
            name: data.name || 'Unknown',
            email: data.email || 'N/A',
            phone: data.phone || 'N/A',
            department: data.department || data.specialization || 'General',
            specialization: data.specialization || 'General Practice',
            status: data.status || 'active',
            slots: data.slots || {},
            imageUrl: data.imageUrl || 'https://via.placeholder.com/70x70.png?text=DR',
            experienceYears: data.experienceYears || data.experience || 0,
            expertise: data.expertise || data.specialization || '',
            qualification: data.qualification || data.degree || '',
          };
        });
        setDoctors(doctorList);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    };
    fetchDoctors();
  }, []);

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

  const handleSlotSelection = (doctorId: string, timeSlot: string) => {
    console.log(`Booking request: Doctor ID ${doctorId} at ${timeSlot}`);
    navigate(`/book-appointment/confirm?doctorId=${doctorId}&slot=${encodeURIComponent(timeSlot)}`);
  };

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
        {/* Sidebar */}
        <div className="sidebar-wrapper">
          <button className="sidebar-toggle-button" onClick={handleToggleSidebar}>
            <i 
              className={`fas ${isSidebarOpen ? 'fa-angle-left' : 'fa-angle-right'}`}
              title={isSidebarOpen ? 'Collapse Menu' : 'Expand Menu'}
            ></i>
            {isSidebarOpen && <span className="toggle-text">Collapse Menu</span>}
          </button>

          <div className="dashboard-nav">
            <nav>
              <button className="nav-button active" onClick={() => handleNavigate('/dashboard')}>
                <i className="fas fa-home"></i> {isSidebarOpen && <span>Dashboard Home</span>}
              </button>
              <button className="nav-button" onClick={() => handleNavigate('/history')}>
                <i className="fas fa-history"></i> {isSidebarOpen && <span>Visit History</span>}
              </button>
              <button className="nav-button" onClick={() => handleNavigate('/records')}>
                <i className="fas fa-folder-open"></i> {isSidebarOpen && <span>My Records</span>}
              </button>
              <button className="nav-button" onClick={() => handleNavigate('/prescriptions')}>
                <i className="fas fa-file-prescription"></i> {isSidebarOpen && <span>Prescriptions</span>}
              </button>
              <button className="nav-button" onClick={() => handleNavigate('/appointments')}>
                <i className="fas fa-calendar-alt"></i> {isSidebarOpen && <span>Upcoming Meets</span>}
              </button>
              <button className="nav-button logout-button" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i> {isSidebarOpen && <span>Logout</span>}
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="dashboard-content">
          <div className="info-card doctor-list-card">
            <h3>My Healthcare Team</h3>
            <p>Quickly book an appointment or view details for your primary care providers by selecting an available slot.</p>
            
            <div className="doctor-list-container-override">
              <DoctorList doctors={doctors} onSlotClick={handleSlotSelection} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;