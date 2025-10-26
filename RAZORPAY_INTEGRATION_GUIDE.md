# Razorpay Payment Integration Guide

## 🎯 Overview

Your hospital management system now has a complete appointment booking and payment system using Razorpay. Here's how everything works:

## 🔑 Razorpay Test Credentials

```javascript
Key ID: rzp_test_XiEOZcAjQ3Gu0D
Key Secret: QQhXR0UOmNmZbQCDRX8zTMoa
```

**Note:** These are test credentials. For production, replace with live credentials from Razorpay Dashboard.

## 📋 Features Implemented

### ✅ 1. Doctor Listings with Available Slots
- Patient dashboard displays all doctors
- Shows doctor information (name, specialization, department, image)
- Displays time slots with availability status
- Color-coded slots (green = available, red = booked)

### ✅ 2. Appointment Booking with Payment
- Click on available time slot to book
- Razorpay payment gateway opens automatically
- Test payment of ₹500 per appointment
- Real-time payment processing

### ✅ 3. Automatic Slot Update
- After successful payment, doctor's slot changes from `false` to `true` in Firestore
- Slot becomes unavailable for other patients
- Real-time synchronization across all users

### ✅ 4. Video Call Redirect
- After payment, user is redirected to video call page
- Appointment ID passed in URL
- Placeholder for video calling implementation

### ✅ 5. Appointments Tracking
- All appointments stored in Firestore `appointments` collection
- Doctor can see their appointments in doctor dashboard
- Both doctor and patient can join video call from their dashboards

## 🏗️ System Architecture

### Database Structure

#### Firestore Collections:

**1. appointments/**
```javascript
{
  id: "APT1729445123456",
  patientId: "PAT...",
  patientName: "John Doe",
  patientEmail: "patient@example.com",
  doctorId: "DOC...",
  doctorName: "Dr. Smith",
  doctorEmail: "doctor@example.com",
  timeSlot: "09-10",
  appointmentDate: timestamp,
  status: "scheduled", // scheduled | completed | cancelled
  paymentStatus: "completed", // pending | completed | failed
  razorpayOrderId: "order_...",
  razorpayPaymentId: "pay_...",
  razorpaySignature: "signature...",
  amount: 500,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**2. doctors/{userId}**
```javascript
{
  // ... existing fields
  slots: {
    "09-10": false,  // false = available
    "10-11": true,   // true = booked
    "14-15": false
  }
}
```

## 🔄 Complete Flow

### Patient Booking Flow

1. **Patient logs in** → Redirected to Patient Dashboard
2. **Views available doctors** with their time slots
3. **Clicks on available time slot** (e.g., 09-10)
4. **Razorpay payment gateway opens**
   - Pre-filled with patient details
   - Amount: ₹500
   - Test mode active
5. **Makes payment** using test card
6. **System processes payment:**
   - Creates appointment in Firestore
   - Updates appointment with payment details
   - Changes doctor's slot from `false` to `true`
7. **Redirects to video call page** (`/video-call/{appointmentId}`)

### Doctor View Flow

1. **Doctor logs in** → Redirected to Doctor Dashboard
2. **Views profile information**
3. **Sees list of appointments:**
   - Patient name and email
   - Time slot
   - Payment status
   - Appointment status
4. **Clicks "Join Video Call"** for any appointment
5. **Opens video call page**

## 🧪 Testing with Razorpay Test Mode

### Test Card Details

**For Successful Payment:**
```
Card Number: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date
Name: Any name
```

**For Failed Payment:**
```
Card Number: 4000 0000 0000 0002
```

**Test UPI:**
```
UPI ID: success@razorpay
```

**Test Netbanking:**
- Select any bank
- Use "success" or "failure" as test username

### Testing Steps

1. **Create a Doctor Account:**
   ```
   - Register as Doctor
   - Add specialization, department
   - Note: Initial slots are not set, add them manually in Firestore
   ```

2. **Add Slots to Doctor (Firestore Console):**
   ```
   Navigate to: doctors/{doctorUserId}
   Add field: slots (Map)
   Add sub-fields:
     - "09-10": false
     - "10-11": false
     - "14-15": false
     - "15-16": false
   ```

3. **Create a Patient Account:**
   ```
   - Register as Patient
   - Fill in all details
   ```

4. **Book Appointment:**
   ```
   - Login as patient
   - See available doctors
   - Click on any green (available) time slot
   - Payment gateway opens
   ```

5. **Make Test Payment:**
   ```
   - Use test card: 4111 1111 1111 1111
   - Enter any CVV and future expiry
   - Click Pay
   - Payment should succeed
   ```

6. **Verify:**
   ```
   - Should redirect to video call page
   - Check Firestore: slot should be "true" now
   - Check Firestore: appointment created
   - Doctor dashboard should show the appointment
   ```

## 📁 File Structure

```
src/
├── types/
│   ├── user.types.ts           # User type definitions
│   └── appointment.types.ts    # Appointment & payment types
├── services/
│   ├── paymentService.ts       # Razorpay integration
│   └── appointmentService.ts   # Appointment CRUD operations
├── pages/
│   ├── Dashboard/
│   │   ├── PatientDashboard.tsx    # Patient view with bookings
│   │   ├── PatientDashboard.css
│   │   ├── DoctorDashboard.tsx     # Doctor view with appointments
│   │   └── DoctorDashboard.css
│   └── VideoCall.tsx           # Video call placeholder
└── App.tsx                     # Updated routing
```

## 🔐 Security Considerations

### Current Implementation (Development)
- ✅ Client-side Razorpay integration
- ✅ Test mode credentials
- ✅ Protected routes
- ✅ Firebase authentication

### For Production (Recommended)
1. **Move payment order creation to backend:**
   ```javascript
   // Backend API (Node.js example)
   app.post('/create-order', async (req, res) => {
     const order = await razorpay.orders.create({
       amount: 50000, // ₹500 in paise
       currency: 'INR',
       receipt: `receipt_${Date.now()}`
     });
     res.json(order);
   });
   ```

2. **Verify payment signature on backend:**
   ```javascript
   const crypto = require('crypto');
   
   app.post('/verify-payment', (req, res) => {
     const { orderId, paymentId, signature } = req.body;
     const generated_signature = crypto
       .createHmac('sha256', 'YOUR_KEY_SECRET')
       .update(orderId + "|" + paymentId)
       .digest('hex');
     
     if (generated_signature === signature) {
       // Payment is valid
       res.json({ verified: true });
     }
   });
   ```

3. **Set up Firestore security rules:**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /appointments/{appointmentId} {
         allow read: if request.auth != null && 
           (resource.data.patientId == request.auth.uid ||
            resource.data.doctorId == request.auth.uid);
         allow create: if request.auth != null;
         allow update: if request.auth != null &&
           resource.data.patientId == request.auth.uid;
       }
     }
   }
   ```

4. **Use environment variables:**
   ```env
   VITE_RAZORPAY_KEY_ID=rzp_test_XiEOZcAjQ3Gu0D
   VITE_RAZORPAY_KEY_SECRET=QQhXR0UOmNmZbQCDRX8zTMoa
   ```

## 🎨 UI/UX Features

### Patient Dashboard
- **Doctor Cards:** Beautiful cards with doctor info and image
- **Slot Buttons:** Color-coded availability status
- **Payment Overlay:** Loading state during payment processing
- **Responsive Design:** Works on mobile and desktop

### Doctor Dashboard
- **Appointment List:** All appointments with details
- **Status Badges:** Visual payment and appointment status
- **Join Call Button:** Quick access to video consultations

### Video Call Page
- **Professional Layout:** Dark theme with controls
- **Appointment Info:** Sidebar with details
- **Control Buttons:** Mute, video, screen share, chat
- **Placeholder:** Ready for video SDK integration

## 🚀 Next Steps

### Immediate Enhancements
1. **Add Video Calling:**
   - Integrate Agora/Twilio/Jitsi
   - Real-time communication
   - Screen sharing

2. **Appointment History:**
   - Past appointments for patients
   - Completed consultations for doctors

3. **Notifications:**
   - Email confirmation after booking
   - SMS reminders
   - In-app notifications

4. **Cancellation/Rescheduling:**
   - Cancel appointments
   - Reschedule with refund
   - Update slot availability

5. **Reviews & Ratings:**
   - Rate doctors after consultation
   - Display ratings on doctor cards

### Advanced Features
1. **Prescription Management:**
   - Upload/download prescriptions
   - E-prescriptions

2. **Medical Records:**
   - Upload lab reports
   - Medical history

3. **Analytics Dashboard:**
   - Booking statistics
   - Revenue tracking
   - Popular time slots

## 🐛 Troubleshooting

### Payment Gateway Not Opening
```
1. Check browser console for errors
2. Verify Razorpay script is loaded:
   - Look for "https://checkout.razorpay.com/v1/checkout.js"
3. Check if popup is blocked by browser
4. Verify key ID is correct
```

### Slot Not Updating After Payment
```
1. Check Firestore rules allow write
2. Verify doctor ID is correct
3. Check browser console for errors
4. Ensure slot field exists in doctor document
```

### Video Call Page Not Loading
```
1. Verify appointment ID in URL
2. Check if appointment exists in Firestore
3. Verify user is authenticated
4. Check browser console for errors
```

### Can't See Doctors on Patient Dashboard
```
1. Ensure doctors collection has documents
2. Verify doctors have slots field
3. Check Firestore read permissions
4. Add at least one slot to doctor: { "09-10": false }
```

## 📊 Testing Checklist

- [ ] Doctor registration works
- [ ] Patient registration works
- [ ] Doctor appears on patient dashboard
- [ ] Slots are visible
- [ ] Available slots are green, booked slots are red
- [ ] Clicking slot opens Razorpay
- [ ] Test payment succeeds
- [ ] Slot changes to booked after payment
- [ ] Redirects to video call page
- [ ] Appointment appears in doctor dashboard
- [ ] Both can join video call page
- [ ] Appointment details are correct

---

**🎉 Your appointment booking system with Razorpay is ready to use!**

For questions or issues, check Firebase Console and browser console for error messages.

