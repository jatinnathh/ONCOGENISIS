// User types
export type UserType = 'doctor' | 'patient' | 'management';

// Base User interface
export interface BaseUser {
  id: string;
  email: string;
  userType: UserType;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Doctor interface
export interface Doctor {
  id: string;
  userId: string;
  doctorId: string;
  name: string;
  specialization?: string;
  department?: string;
  phone?: string;
  status: 'active' | 'inactive';
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Management interface
export interface Management {
  id: string;
  userId: string;
  empId: string;
  name: string;
  role?: string;
  department?: string;
  phone?: string;
  status: 'active' | 'inactive';
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Patient interface
export interface Patient {
  id: string;
  userId: string;
  patientId: string;
  name: string;
  phone?: string;
  address?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  emergencyContact?: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Registration data interfaces
export interface DoctorRegistrationData {
  name: string;
  specialization?: string;
  department?: string;
  phone?: string;
}

export interface ManagementRegistrationData {
  name: string;
  role?: string;
  department?: string;
  phone?: string;
}

export interface PatientRegistrationData {
  name: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  emergencyContact?: string;
}

