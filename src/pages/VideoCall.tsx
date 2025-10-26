import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAppointmentById } from '../services/appointmentService';
import type { Appointment, ChatMessage } from '../types';
import './VideoCall.css';

const VideoCall: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [meetLinkCopied, setMeetLinkCopied] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      if (appointmentId) {
        try {
          const appt = await getAppointmentById(appointmentId);
          setAppointment(appt);
        } catch (error) {
          console.error('Error fetching appointment:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAppointment();
  }, [appointmentId]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !appointment) return;

    const message: ChatMessage = {
      id: `MSG${Date.now()}`,
      senderId: user.uid,
      senderName: appointment.patientName, // In real app, get from user profile
      senderType: 'patient', // Determine based on user type
      message: newMessage.trim(),
      timestamp: new Date(),
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const handleCopyMeetLink = () => {
    if (appointment?.meetLink) {
      navigator.clipboard.writeText(appointment.meetLink);
      setMeetLinkCopied(true);
      setTimeout(() => setMeetLinkCopied(false), 2000);
    }
  };

  const handleJoinMeet = () => {
    if (appointment?.meetLink) {
      window.open(appointment.meetLink, '_blank');
    }
  };

  const handleBack = () => {
    navigate('/booked-appointments');
  };

  if (loading) {
    return (
      <div className="video-call-container">
        <div className="loading-spinner">Loading appointment...</div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="video-call-container">
        <div className="error-message">
          <h2>Appointment Not Found</h2>
          <button onClick={handleBack}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="video-call-container">
      {/* Header */}
      <div className="video-call-header">
        <div className="header-left">
          <button className="back-button" onClick={handleBack}>
            ← Back
          </button>
          <div className="appointment-info">
            <h2>Video Consultation</h2>
            <p>Dr. {appointment.doctorName} • {appointment.timeSlot}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="video-call-main">
        {/* Left Side - Chat */}
        <div className="chat-section">
          <div className="chat-header">
            <h3>💬 Chat with Doctor</h3>
          </div>

          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="no-messages">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message ${msg.senderType === 'patient' ? 'sent' : 'received'}`}
                >
                  <div className="message-header">
                    <span className="sender-name">{msg.senderName}</span>
                    <span className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="message-content">{msg.message}</div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          <form className="chat-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="chat-input"
            />
            <button type="submit" className="send-button" disabled={!newMessage.trim()}>
              Send
            </button>
          </form>
        </div>

        {/* Right Side - Google Meet */}
        <div className="meet-section">
          <div className="meet-header">
            <h3>🎥 Video Meeting</h3>
          </div>

          <div className="meet-content">
            <div className="meet-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" width="80" height="80">
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
              </svg>
            </div>

            <div className="appointment-details">
              <div className="detail-item">
                <span className="label">Doctor:</span>
                <span className="value">Dr. {appointment.doctorName}</span>
              </div>
              <div className="detail-item">
                <span className="label">Patient:</span>
                <span className="value">{appointment.patientName}</span>
              </div>
              <div className="detail-item">
                <span className="label">Time Slot:</span>
                <span className="value">{appointment.timeSlot}</span>
              </div>
              <div className="detail-item">
                <span className="label">Appointment ID:</span>
                <span className="value">{appointment.id}</span>
              </div>
            </div>

            {appointment.meetLink ? (
              <div className="meet-link-section">
                <div className="meet-link-box">
                  <span className="meet-link-label">Google Meet Link:</span>
                  <div className="meet-link-value">
                    <input
                      type="text"
                      readOnly
                      value={appointment.meetLink}
                      className="meet-link-input"
                    />
                    <button
                      className="copy-link-button"
                      onClick={handleCopyMeetLink}
                      title="Copy link"
                    >
                      {meetLinkCopied ? '✓' : '📋'}
                    </button>
                  </div>
                  {meetLinkCopied && <span className="copied-toast">Link copied!</span>}
                </div>

                <button className="join-meet-button" onClick={handleJoinMeet}>
                  <span className="button-icon">🎥</span>
                  Join Google Meet
                </button>

                <p className="meet-info">
                  Click the button above to join the video consultation with your doctor.
                  The meeting link has been generated for this appointment.
                </p>
              </div>
            ) : (
              <div className="no-meet-link">
                <p>Meeting link is being generated...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;

