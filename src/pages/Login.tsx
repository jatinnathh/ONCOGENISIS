import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { UserType } from '../types';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  
  // User type selection
  const [userType, setUserType] = useState<UserType>('patient');
  
  // Common fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  // Doctor/Management fields
  const [department, setDepartment] = useState('');
  
  // Doctor specific
  const [specialization, setSpecialization] = useState('');
  
  // Management specific
  const [role, setRole] = useState('');
  
  // Patient specific
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [emergencyContact, setEmergencyContact] = useState('');

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        // Prepare profile data based on user type
        let profileData: any = { name, phone };
        
        if (userType === 'doctor') {
          profileData = { ...profileData, specialization, department };
        } else if (userType === 'management') {
          profileData = { ...profileData, role, department };
        } else if (userType === 'patient') {
          profileData = { 
            ...profileData, 
            address, 
            dateOfBirth, 
            gender, 
            emergencyContact 
          };
        }
        
        await signup(email, password, userType, profileData);
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setDepartment('');
    setSpecialization('');
    setRole('');
    setAddress('');
    setDateOfBirth('');
    setGender('male');
    setEmergencyContact('');
  };

  return (
    <div className="login-container">
      <div className="login-brand">
        <div className="brand-content">
          <h1 className="brand-title">Welcome Back</h1>
          <p className="brand-description">
            Sign in to access your dashboard and manage your account with ease.
          </p>
          <div className="brand-features">
            <div className="feature-item">
              <span className="feature-icon">🔒</span>
              <span>Secure Authentication</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <span>Fast & Reliable</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎨</span>
              <span>Modern Interface</span>
            </div>
          </div>
        </div>
      </div>
      <div className="login-card">
        <h1>{isSignup ? 'Sign Up' : 'Login'}</h1>
        <p className="login-subtitle">
          {isSignup ? 'Create a new account' : 'Welcome back! Please login to your account.'}
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* User Type Selection - Only for Signup */}
          {isSignup && (
            <div className="form-group">
              <label htmlFor="userType">Register As</label>
              <div className="user-type-selector">
                <button
                  type="button"
                  className={`type-button ${userType === 'patient' ? 'active' : ''}`}
                  onClick={() => { setUserType('patient'); resetForm(); }}
                >
                  🏥 Patient
                </button>
                <button
                  type="button"
                  className={`type-button ${userType === 'doctor' ? 'active' : ''}`}
                  onClick={() => { setUserType('doctor'); resetForm(); }}
                >
                  👨‍⚕️ Doctor
                </button>
                <button
                  type="button"
                  className={`type-button ${userType === 'management' ? 'active' : ''}`}
                  onClick={() => { setUserType('management'); resetForm(); }}
                >
                  💼 Management
                </button>
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              minLength={6}
            />
          </div>

          {/* Additional fields for signup */}
          {isSignup && (
            <>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Doctor-specific fields */}
              {userType === 'doctor' && (
                <>
                  <div className="form-group">
                    <label htmlFor="specialization">Specialization</label>
                    <input
                      type="text"
                      id="specialization"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      placeholder="e.g., Cardiology, Neurology"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="department">Department</label>
                    <input
                      type="text"
                      id="department"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Enter department"
                    />
                  </div>
                </>
              )}

              {/* Management-specific fields */}
              {userType === 'management' && (
                <>
                  <div className="form-group">
                    <label htmlFor="role">Role</label>
                    <input
                      type="text"
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g., Admin, HR Manager"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="department">Department</label>
                    <input
                      type="text"
                      id="department"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Enter department"
                    />
                  </div>
                </>
              )}

              {/* Patient-specific fields */}
              {userType === 'patient' && (
                <>
                  <div className="form-group">
                    <label htmlFor="dateOfBirth">Date of Birth</label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="gender">Gender</label>
                    <select
                      id="gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'other')}
                      className="select-input"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="address">Address</label>
                    <textarea
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your address"
                      rows={2}
                      className="textarea-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="emergencyContact">Emergency Contact</label>
                    <input
                      type="tel"
                      id="emergencyContact"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      placeholder="Emergency contact number"
                    />
                  </div>
                </>
              )}
            </>
          )}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Loading...' : isSignup ? 'Sign Up' : 'Login'}
          </button>
        </form>

        <div className="toggle-mode">
          {isSignup ? 'Already have an account? ' : "Don't have an account? "}
          <button
            type="button"
            className="toggle-button"
            onClick={() => {
              setIsSignup(!isSignup);
              setError('');
              resetForm();
            }}
          >
            {isSignup ? 'Login' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
