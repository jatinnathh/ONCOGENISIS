import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserProfile } from '../../services/userService';
import { getDoctorAppointments } from '../../services/appointmentService';
import type { Doctor, Appointment } from '../../types';
import './DoctorDashboard.css';

const DoctorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const profileData = await getUserProfile(user.uid, 'doctor');
          setProfile(profileData as Doctor);

          if (profileData) {
            const doctorAppts = await getDoctorAppointments((profileData as Doctor).doctorId);
            setAppointments(doctorAppts);
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const handleJoinCall = (appointmentId: string) => {
    navigate(`/video-call/${appointmentId}`);
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
          <p>Manage your appointments and patient consultations.</p>
        </div>

        <div className="profile-card">
          <h3>Doctor Profile</h3>
          <div className="profile-grid">
            <div className="profile-item">
              <strong>Doctor ID:</strong>
              <span>{profile?.doctorId || 'N/A'}</span>
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
          </div>
        </div>

        {/* Appointments Section */}
        <div className="appointments-section">
          <h3>Your Appointments</h3>
          {appointments.length === 0 ? (
            <p className="no-appointments">No appointments scheduled yet.</p>
          ) : (
            <div className="appointments-list">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="appointment-card">
                  <div className="appointment-header">
                    <div>
                      <h4>{appointment.patientName}</h4>
                      <p className="appointment-time">Time: {appointment.timeSlot}</p>
                    </div>
                    <span className={`payment-status ${appointment.paymentStatus}`}>
                      {appointment.paymentStatus}
                    </span>
                  </div>
                  <div className="appointment-details">
                    <p><strong>Patient Email:</strong> {appointment.patientEmail}</p>
                    <p><strong>Amount:</strong> ₹{appointment.amount}</p>
                    <p><strong>Status:</strong> {appointment.status}</p>
                  </div>
                  {appointment.paymentStatus === 'completed' && (
                    <button 
                      className="join-call-button"
                      onClick={() => handleJoinCall(appointment.id)}
                    >
                      Join Video Call
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
