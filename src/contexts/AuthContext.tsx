import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../services/firebase';
import {
  createBaseUser,
  createDoctorProfile,
  createPatientProfile,
  createManagementProfile,
  getBaseUser,
  getUserProfile
} from '../services/userService';
import type {
  UserType,
  DoctorRegistrationData,
  PatientRegistrationData,
  ManagementRegistrationData,
  Doctor,
  Patient,
  Management
} from '../types';

type RegistrationData = DoctorRegistrationData | PatientRegistrationData | ManagementRegistrationData;
type UserProfile = Doctor | Patient | Management | null;

interface AuthContextType {
  user: User | null;
  userType: UserType | null;
  userProfile: UserProfile;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    userType: UserType,
    profileData: RegistrationData
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch and set user profile
  const fetchUserProfile = async (userId: string, type: UserType) => {
    try {
      const profile = await getUserProfile(userId, type);
      setUserProfile(profile);
      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
      return null;
    }
  };

  // Refresh profile data (useful after profile updates)
  const refreshProfile = async () => {
    if (user && userType) {
      await fetchUserProfile(user.uid, userType);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        try {
          // Fetch user type from Firestore
          const baseUser = await getBaseUser(user.uid);
          
          if (baseUser) {
            setUserType(baseUser.userType);
            // Fetch complete user profile
            await fetchUserProfile(user.uid, baseUser.userType);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          setUserType(null);
          setUserProfile(null);
        }
      } else {
        setUserType(null);
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Profile will be loaded by onAuthStateChanged
    } finally {
      setLoading(false);
    }
  };

  const signup = async (
    email: string,
    password: string,
    userType: UserType,
    profileData: RegistrationData
  ) => {
    setLoading(true);
    
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;

    try {
      // Create base user document
      await createBaseUser(userId, email, userType);

      // Create type-specific profile
      if (userType === 'doctor') {
        await createDoctorProfile(userId, email, profileData as DoctorRegistrationData);
      } else if (userType === 'patient') {
        await createPatientProfile(userId, email, profileData as PatientRegistrationData);
      } else if (userType === 'management') {
        await createManagementProfile(userId, email, profileData as ManagementRegistrationData);
      }

      setUserType(userType);
      
      // Fetch the newly created profile
      await fetchUserProfile(userId, userType);
    } catch (error) {
      // If Firestore operations fail, delete the Auth user
      await userCredential.user.delete();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUserType(null);
    setUserProfile(null);
  };

  const value = {
    user,
    userType,
    userProfile,
    loading,
    login,
    signup,
    logout,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper hooks for type-safe profile access
export const useDoctorProfile = () => {
  const { userProfile, userType } = useAuth();
  if (userType === 'doctor') {
    return userProfile as Doctor | null;
  }
  return null;
};

export const usePatientProfile = () => {
  const { userProfile, userType } = useAuth();
  if (userType === 'patient') {
    return userProfile as Patient | null;
  }
  return null;
};

export const useManagementProfile = () => {
  const { userProfile, userType } = useAuth();
  if (userType === 'management') {
    return userProfile as Management | null;
  }
  return null;
};

// Type guard functions for runtime checks
export const isDoctor = (profile: UserProfile): profile is Doctor => {
  return profile !== null && 'doctorId' in profile;
};

export const isPatient = (profile: UserProfile): profile is Patient => {
  return profile !== null && 'patientId' in profile;
};

export const isManagement = (profile: UserProfile): profile is Management => {
  return profile !== null && 'empId' in profile;
};