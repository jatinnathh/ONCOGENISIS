# Doctor Signup & Firestore Structure

## Overview
This document describes the complete doctor signup process and the exact Firestore structure used in the application.

## Firestore Collection: `doctors`

### Document Structure
Each doctor document is stored with the Firebase Auth `userId` as the document ID.

```javascript
{
  // Auto-generated fields
  "userId": "9pOqwe12AfRt56LopVbN34t",           // Firebase Auth UID (document ID)
  "doctorId": "DOC1760984601122334",             // Custom doctor ID
  "imageUrl": "https://randomuser.me/api/portraits/men/15.jpg",  // Random profile picture
  
  // User-provided fields (from signup form)
  "name": "Dr. Arjun Singh",                     // Full name with "Dr." prefix optional
  "email": "arjun.singh@hospital.com",           // Email (from Firebase Auth)
  "phone": "9001234567",                         // Phone number (required)
  "department": "Orthopedics",                   // Medical department (required)
  "specialization": "Bone & Joint Specialist",   // Area of expertise (required)
  
  // Default fields
  "status": "active",                            // Active/Inactive status
  "slots": {                                     // Available time slots
    "09-10": false,  // false = available, true = booked
    "10-11": false,
    "11-12": false,
    "12-13": false,
    "14-15": false,
    "15-16": false,
    "16-17": false,
    "17-18": false
  },
  
  // Timestamps
  "createdAt": Timestamp,                        // Auto-generated
  "updatedAt": Timestamp                         // Auto-generated
}
```

## Doctor Signup Flow

### 1. User Registration Form
Located in: `src/pages/Login.tsx`

**Required Fields:**
- Email (validated by Firebase)
- Password (minimum 6 characters)
- Full Name (e.g., "Dr. Arjun Singh")
- Phone Number (e.g., "9001234567")
- Specialization (e.g., "Bone & Joint Specialist")
- Department (e.g., "Orthopedics")

### 2. Profile Creation
Located in: `src/services/userService.ts`

**Process:**
1. Firebase Authentication creates user account
2. `createDoctorProfile()` is called with user data
3. Auto-generates:
   - `doctorId` using format: `DOC{timestamp}{random3digits}`
   - `imageUrl` from randomuser.me API (random male/female portrait)
   - `slots` object with 8 default time slots (all set to false)
   - `status` set to "active"
   - `createdAt` and `updatedAt` timestamps

### 3. Firestore Storage
- Document stored in `doctors` collection
- Document ID = Firebase Auth `userId`
- All fields stored as shown in structure above

## TypeScript Interface

Located in: `src/types/user.types.ts`

```typescript
export interface Doctor {
  id: string;                           // Firestore document ID
  userId: string;                       // Firebase Auth user ID
  doctorId: string;                     // Custom doctor ID (DOC...)
  name: string;
  email: string;
  phone: string;
  department: string;
  specialization: string;
  status: 'active' | 'inactive';
  slots: Record<string, boolean>;       // { "09-10": false, ... }
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Patient Dashboard Display

### Doctor Cards
Located in: `src/pages/Dashboard/PatientDashboard.tsx`

**Displayed Information:**
- Profile picture (from `imageUrl`)
- Doctor name
- Specialization
- Department
- Available time slots (only shows slots where value is `false`)
- Consultation fee (₹500)

### Slot Booking
When a patient books a slot:
1. Payment is processed via Razorpay
2. Slot value changes: `false` → `true`
3. Appointment created in `appointments` collection
4. Appointment added to patient's `bookedAppointments` subcollection
5. Google Meet link generated automatically

## Important Notes

### For Developers:
1. **All doctor signup fields are now required** to ensure complete profiles
2. **Default slots are all set to false** (available) when doctor signs up
3. **Random profile pictures** are assigned from randomuser.me API
4. **Doctor ID format**: DOC{13-digit-timestamp}{3-random-digits}

### For Testing:
1. Use doctor signup form with all fields filled
2. New doctor will immediately appear in patient dashboard
3. All time slots will be available for booking
4. Profile picture is randomly assigned (refresh to see different ones)

## Files Modified

1. **src/services/userService.ts**
   - Added `generateDoctorImageUrl()` function
   - Added `generateDefaultSlots()` function
   - Updated `createDoctorProfile()` to include imageUrl and slots

2. **src/types/user.types.ts**
   - Updated `Doctor` interface to include all required fields
   - Added proper TypeScript types for status field

3. **src/pages/Login.tsx**
   - Made phone, specialization, and department fields required
   - Updated placeholder text with examples

## Example Doctor Signup

```
Email: john.doe@hospital.com
Password: securepass123
Name: Dr. John Doe
Phone: 9876543210
Specialization: Cardiologist
Department: Cardiology
```

**Result in Firestore:**
```javascript
doctors/uniqueFirebaseAuthUID: {
  userId: "uniqueFirebaseAuthUID",
  doctorId: "DOC1730123456789123",
  name: "Dr. John Doe",
  email: "john.doe@hospital.com",
  phone: "9876543210",
  department: "Cardiology",
  specialization: "Cardiologist",
  imageUrl: "https://randomuser.me/api/portraits/men/42.jpg",
  status: "active",
  slots: {
    "09-10": false,
    "10-11": false,
    "11-12": false,
    "12-13": false,
    "14-15": false,
    "15-16": false,
    "16-17": false,
    "17-18": false
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

This doctor will now appear in the patient dashboard with all available slots ready for booking! ✅

