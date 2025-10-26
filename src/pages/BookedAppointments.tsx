import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPatientBookedAppointments } from '../services/appointmentService';
import type { Appointment } from '../types';
import './BookedAppointments.css';

const BookedAppointments: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (user) {
        try {
          const bookedAppointments = await getPatientBookedAppointments(user.uid);
          setAppointments(bookedAppointments);
        } catch (error) {
          console.error('Error fetching appointments:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAppointments();
  }, [user]);

  const handleViewDetails = (appointmentId: string) => {
    navigate(`/appointment-details/${appointmentId}`);
  };

  const handleJoinCall = (appointmentId: string) => {
    navigate(`/video-call/${appointmentId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return '#00a699';
      case 'completed': return '#717171';
      case 'cancelled': return '#ff5a5f';
      default: return '#717171';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#00a699';
      case 'pending': return '#ffb400';
      case 'failed': return '#ff5a5f';
      default: return '#717171';
    }
  };

  if (loading) {
    return (
      <div className="booked-appointments-container">
        <div className="loading-spinner">Loading your appointments...</div>
      </div>
    );
  }

  return (
    <div className="booked-appointments-container">
      <div className="appointments-header">
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>My Appointments</h1>
        <p className="subtitle">View and manage your booked appointments</p>
      </div>

      <div className="appointments-content">
        {appointments.length === 0 ? (
          <div className="no-appointments">
            <div className="no-appointments-icon">📅</div>
            <h3>No Appointments Yet</h3>
            <p>You haven't booked any appointments. Visit the dashboard to book one!</p>
            <button className="primary-button" onClick={() => navigate('/dashboard')}>
              Book an Appointment
            </button>
          </div>
        ) : (
          <div className="appointments-list">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="appointment-card">
                <div className="appointment-header">
                  <div className="appointment-title">
                    <h3>{appointment.doctorName}</h3>
                    <p className="appointment-id">Appointment ID: {appointment.id}</p>
                  </div>
                  <div className="appointment-badges">
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: getStatusColor(appointment.status) }}
                    >
                      {appointment.status}
                    </span>
                    <span 
                      className="payment-badge" 
                      style={{ backgroundColor: getPaymentStatusColor(appointment.paymentStatus) }}
                    >
                      {appointment.paymentStatus === 'completed' ? 'Paid' : appointment.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="appointment-details">
                  <div className="detail-row">
                    <span className="detail-label">⏰ Time Slot:</span>
                    <span className="detail-value">{appointment.timeSlot}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">💰 Amount:</span>
                    <span className="detail-value">₹{appointment.amount}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">📧 Doctor Email:</span>
                    <span className="detail-value">{appointment.doctorEmail}</span>
                  </div>
                  {appointment.razorpayPaymentId && (
                    <div className="detail-row">
                      <span className="detail-label">💳 Payment ID:</span>
                      <span className="detail-value payment-id">{appointment.razorpayPaymentId}</span>
                    </div>
                  )}
                </div>

                <div className="appointment-actions">
                  <button 
                    className="secondary-button"
                    onClick={() => handleViewDetails(appointment.id)}
                  >
                    View Details
                  </button>
                  {appointment.paymentStatus === 'completed' && (
                    <button 
                      className="primary-button"
                      onClick={() => handleJoinCall(appointment.id)}
                    >
                      Join Video Call
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookedAppointments;


