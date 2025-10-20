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
  getBaseUser 
} from '../services/userService';
import type { 
  UserType, 
  DoctorRegistrationData, 
  PatientRegistrationData, 
  ManagementRegistrationData 
} from '../types';

type RegistrationData = DoctorRegistrationData | PatientRegistrationData | ManagementRegistrationData;

interface AuthContextType {
  user: User | null;
  userType: UserType | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string, 
    password: string, 
    userType: UserType, 
    profileData: RegistrationData
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Fetch user type from Firestore
        const baseUser = await getBaseUser(user.uid);
        if (baseUser) {
          setUserType(baseUser.userType);
        }
      } else {
        setUserType(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (
    email: string, 
    password: string, 
    userType: UserType, 
    profileData: RegistrationData
  ) => {
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
    } catch (error) {
      // If Firestore operations fail, delete the Auth user
      await userCredential.user.delete();
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUserType(null);
  };

  const value = {
    user,
    userType,
    loading,
    login,
    signup,
    logout
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

