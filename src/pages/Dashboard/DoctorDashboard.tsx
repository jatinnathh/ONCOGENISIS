import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserProfile } from '../../services/userService';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import type { Doctor } from '../../types';
import './Dashboard.css';

interface Appointment {
  id: string;
  amount: number;
  appointmentDate: Timestamp;
  createdAt: Timestamp;
  doctorEmail: string;
  doctorId: string;
  doctorName: string;
  patientEmail: string;
  patientId: string;
  patientName: string;
  paymentStatus: string;
  status: string;
  timeSlot: string;
  updatedAt: Timestamp;
}

// Helper function to parse time slot and get start time for sorting
const parseTimeSlot = (timeSlot: string): number => {
  const [start] = timeSlot.split('-');
  return parseInt(start);
};

// Helper function to format time slot
const formatTimeSlot = (timeSlot: string): string => {
  const [start, end] = timeSlot.split('-');
  const startHour = parseInt(start);
  const endHour = parseInt(end);
  
  const formatHour = (hour: number) => {
    if (hour === 0) return '12:00 AM';
    if (hour === 12) return '12:00 PM';
    if (hour > 12) return `${hour - 12}:00 PM`;
    return `${hour}:00 AM`;
  };
  
  return `${formatHour(startHour)} - ${formatHour(endHour)}`;
};

const DoctorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

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

  // Fetch appointments for the logged-in doctor
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!profile?.doctorId) return;

      setLoadingAppointments(true);
      try {
        const appointmentsRef = collection(db, 'appointments');
        
        // Query for scheduled appointments for this doctor
        const q = query(
          appointmentsRef,
          where('doctorId', '==', profile.doctorId),
          where('status', '==', 'scheduled'),
          orderBy('appointmentDate', 'asc')
        );

        const querySnapshot = await getDocs(q);
        const appointments: Appointment[] = [];
        
        querySnapshot.forEach((doc) => {
          appointments.push({
            id: doc.id,
            ...doc.data()
          } as Appointment);
        });

        // Get today's date at midnight for comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Separate today's appointments and upcoming appointments
        const todayAppts: Appointment[] = [];
        const upcomingAppts: Appointment[] = [];

        appointments.forEach(appointment => {
          const apptDate = appointment.appointmentDate.toDate();
          apptDate.setHours(0, 0, 0, 0);
          
          if (apptDate.getTime() === today.getTime()) {
            todayAppts.push(appointment);
          } else if (apptDate.getTime() > today.getTime()) {
            upcomingAppts.push(appointment);
          }
        });

        // Sort today's appointments by time slot
        todayAppts.sort((a, b) => parseTimeSlot(a.timeSlot) - parseTimeSlot(b.timeSlot));
        
        // Sort upcoming appointments by date, then by time slot
        upcomingAppts.sort((a, b) => {
          const dateCompare = a.appointmentDate.toMillis() - b.appointmentDate.toMillis();
          if (dateCompare !== 0) return dateCompare;
          return parseTimeSlot(a.timeSlot) - parseTimeSlot(b.timeSlot);
        });

        setTodayAppointments(todayAppts);
        setUpcomingAppointments(upcomingAppts.slice(0, 5)); // Limit to 5 upcoming
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoadingAppointments(false);
      }
    };

    fetchAppointments();
  }, [profile]);

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

  // Doctor info object for use in other contexts/components
  const doctorInfo = {
    doctorId: profile?.doctorId,
    doctorName: profile?.name,
    specialty: profile?.specialization,
    email: user?.email,
    department: profile?.department,
    phone: profile?.phone
  };

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

          {/* Stats Cards Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div className="stat-card" style={{ padding: '20px', backgroundColor: '#e3f2fd', borderRadius: '12px', border: '1px solid #90caf9' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ margin: 0, color: '#1565c0', fontSize: '14px', fontWeight: '500' }}>Today's Appointments</p>
                  <h2 style={{ margin: '8px 0 0 0', color: '#0d47a1', fontSize: '32px' }}>{todayAppointments.length}</h2>
                </div>
                <i className="fas fa-calendar-day" style={{ fontSize: '32px', color: '#42a5f5' }}></i>
              </div>
            </div>

            <div className="stat-card" style={{ padding: '20px', backgroundColor: '#f3e5f5', borderRadius: '12px', border: '1px solid #ce93d8' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ margin: 0, color: '#6a1b9a', fontSize: '14px', fontWeight: '500' }}>Upcoming Appointments</p>
                  <h2 style={{ margin: '8px 0 0 0', color: '#4a148c', fontSize: '32px' }}>{upcomingAppointments.length}</h2>
                </div>
                <i className="fas fa-clock" style={{ fontSize: '32px', color: '#ab47bc' }}></i>
              </div>
            </div>

            <div className="stat-card" style={{ padding: '20px', backgroundColor: '#e8f5e9', borderRadius: '12px', border: '1px solid #81c784' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ margin: 0, color: '#2e7d32', fontSize: '14px', fontWeight: '500' }}>Specialization</p>
                  <h3 style={{ margin: '8px 0 0 0', color: '#1b5e20', fontSize: '18px' }}>{profile?.specialization || 'N/A'}</h3>
                </div>
                <i className="fas fa-user-md" style={{ fontSize: '32px', color: '#66bb6a' }}></i>
              </div>
            </div>
          </div>

          {/* Today's Appointments Section */}
          <div className="info-card" style={{ marginBottom: '20px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fas fa-calendar-day" style={{ color: '#1976d2' }}></i>
              Today's Schedule
            </h3>
            {loadingAppointments ? (
              <p style={{ color: '#666', padding: '10px 0' }}>Loading appointments...</p>
            ) : todayAppointments.length > 0 ? (
              <div className="appointments-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px', marginTop: '15px' }}>
                {todayAppointments.map((appointment) => (
                  <div 
                    key={appointment.id} 
                    className="appointment-card"
                    style={{
                      padding: '20px',
                      border: '2px solid #2196f3',
                      borderRadius: '12px',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 2px 8px rgba(33, 150, 243, 0.15)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(33, 150, 243, 0.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(33, 150, 243, 0.15)';
                    }}
                  >
                    <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #e0e0e0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '50%', 
                          backgroundColor: '#e3f2fd', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontSize: '18px'
                        }}>
                          👤
                        </div>
                        <div>
                          <h4 style={{ margin: 0, color: '#1976d2', fontSize: '16px', fontWeight: '600' }}>
                            {appointment.patientName}
                          </h4>
                          <p style={{ margin: '2px 0 0 0', color: '#757575', fontSize: '12px' }}>
                            ID: {appointment.patientId}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ 
                        display: 'inline-block',
                        padding: '8px 16px', 
                        backgroundColor: '#1976d2', 
                        color: 'white', 
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        <i className="fas fa-clock" style={{ marginRight: '8px' }}></i>
                        {formatTimeSlot(appointment.timeSlot)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#555' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="fas fa-envelope" style={{ color: '#757575', width: '16px' }}></i>
                        <span style={{ fontSize: '13px' }}>{appointment.patientEmail}</span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '12px', borderTop: '1px solid #e0e0e0' }}>
                        <span 
                          style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: appointment.paymentStatus === 'pending' ? '#fff3cd' : '#d4edda',
                            color: appointment.paymentStatus === 'pending' ? '#856404' : '#155724',
                            border: `1px solid ${appointment.paymentStatus === 'pending' ? '#ffeaa7' : '#c3e6cb'}`
                          }}
                        >
                          {appointment.paymentStatus === 'pending' ? '⏳ Payment Pending' : '✓ Paid'}
                        </span>
                        <span style={{ color: '#1976d2', fontWeight: 'bold', fontSize: '16px' }}>
                          ₹{appointment.amount}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
                <i className="fas fa-calendar-times" style={{ fontSize: '48px', marginBottom: '16px', color: '#ddd' }}></i>
                <p style={{ margin: 0, fontSize: '16px' }}>No appointments scheduled for today.</p>
              </div>
            )}
          </div>

          {/* Upcoming Appointments Section */}
          <div className="info-card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fas fa-calendar-alt" style={{ color: '#7b1fa2' }}></i>
              Upcoming Appointments
            </h3>
            {loadingAppointments ? (
              <p style={{ color: '#666', padding: '10px 0' }}>Loading appointments...</p>
            ) : upcomingAppointments.length > 0 ? (
              <div style={{ marginTop: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {upcomingAppointments.map((appointment) => (
                    <div 
                      key={appointment.id} 
                      className="appointment-item"
                      style={{
                        padding: '16px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '10px',
                        backgroundColor: '#fafafa',
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                        e.currentTarget.style.borderColor = '#9c27b0';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#fafafa';
                        e.currentTarget.style.borderColor = '#e0e0e0';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '15px', fontWeight: '600' }}>
                            {appointment.patientName}
                          </h4>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '13px', color: '#666' }}>
                            <span>
                              <i className="fas fa-calendar" style={{ marginRight: '6px', color: '#7b1fa2' }}></i>
                              {appointment.appointmentDate.toDate().toLocaleDateString('en-IN', { 
                                day: 'numeric', 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </span>
                            <span>
                              <i className="fas fa-clock" style={{ marginRight: '6px', color: '#7b1fa2' }}></i>
                              {formatTimeSlot(appointment.timeSlot)}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span 
                            style={{
                              padding: '4px 10px',
                              borderRadius: '10px',
                              fontSize: '11px',
                              fontWeight: '600',
                              backgroundColor: appointment.paymentStatus === 'pending' ? '#fff3cd' : '#d4edda',
                              color: appointment.paymentStatus === 'pending' ? '#856404' : '#155724'
                            }}
                          >
                            {appointment.paymentStatus === 'pending' ? 'Pending' : 'Paid'}
                          </span>
                          <span style={{ color: '#7b1fa2', fontWeight: 'bold', fontSize: '15px', minWidth: '70px', textAlign: 'right' }}>
                            ₹{appointment.amount}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  className="nav-button"
                  onClick={() => handleNavigate('/doctor/appointments')}
                  style={{ 
                    marginTop: '16px', 
                    width: '100%', 
                    backgroundColor: '#7b1fa2',
                    color: 'white',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6a1b9a'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#7b1fa2'}
                >
                  <i className="fas fa-arrow-right" style={{ marginRight: '8px' }}></i>
                  View All Appointments
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
                <i className="fas fa-calendar-check" style={{ fontSize: '48px', marginBottom: '16px', color: '#ddd' }}></i>
                <p style={{ margin: 0, fontSize: '16px' }}>No upcoming appointments scheduled.</p>
              </div>
            )}
          </div>

          {/* Profile Card */}
          <div className="profile-card" style={{ marginTop: '20px' }}>
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
              </div>````
              
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

          {/* Quick Actions Info */}
          <div className="info-card" style={{ marginTop: '20px' }}>
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