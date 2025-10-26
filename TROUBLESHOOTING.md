# Razorpay Troubleshooting Guide

## 🔴 Common Error: ERR_BLOCKED_BY_CLIENT

### Problem
```
Failed to load resource: net::ERR_BLOCKED_BY_CLIENT
api.razorpay.com/v2/standard_checkout/preferences
```

### Cause
This error occurs when:
1. **Ad Blocker** is blocking Razorpay API calls
2. **Browser Extensions** (uBlock Origin, AdBlock Plus, Privacy Badger)
3. **Antivirus Software** blocking payment gateway

### Solution

#### Option 1: Disable Ad Blocker (Recommended for Testing)
1. **Chrome/Edge:**
   - Click extension icon
   - Click "Pause on this site" or "Disable for this site"
   - Add `localhost` and `razorpay.com` to whitelist

2. **uBlock Origin:**
   - Click the extension icon
   - Click the power button to disable temporarily
   - Refresh the page

3. **AdBlock Plus:**
   - Click extension icon
   - Toggle off for the current site

#### Option 2: Whitelist Razorpay Domains
Add these domains to your ad blocker's whitelist:
```
*.razorpay.com
api.razorpay.com
checkout.razorpay.com
cdn.razorpay.com
lumberjack.razorpay.com
```

#### Option 3: Use Incognito/Private Mode
1. Open browser in Incognito/Private mode (extensions usually disabled)
2. Navigate to your app
3. Test payment

## 🔴 Error: 400 Bad Request

### Problem
```
Failed to load resource: the server responded with a status of 400 (Bad Request)
```

### Cause
- Invalid or missing Razorpay order ID
- Mock order ID not accepted by Razorpay

### Solution
I've updated the code to work without requiring a backend order creation for testing. The payment will now work in test mode without a proper order ID.

## 🧪 Testing Payment Without Ad Blocker Issues

### Step-by-Step Testing

1. **Disable Ad Blocker**
   - Temporarily disable ALL ad blockers
   - This includes uBlock Origin, AdBlock, Privacy Badger, etc.

2. **Clear Browser Cache**
   ```
   Chrome: Ctrl+Shift+Delete → Clear cached images and files
   ```

3. **Try in Incognito Mode First**
   - Press `Ctrl+Shift+N` (Chrome) or `Ctrl+Shift+P` (Firefox)
   - Open `http://localhost:5173`
   - Test payment flow

4. **Use Test Card**
   ```
   Card Number: 4111 1111 1111 1111
   CVV: 123
   Expiry: 12/25
   Name: Test User
   ```

5. **Check Browser Console**
   - Press F12
   - Go to Console tab
   - Look for any red errors

## 🛡️ Firewall/Antivirus Issues

### Kaspersky/Norton/McAfee
These might block Razorpay. Temporarily disable or add exception:
1. Open antivirus settings
2. Add `razorpay.com` to trusted sites
3. Disable "Web Protection" temporarily for testing

### Windows Defender
1. Go to Settings → Privacy & Security → Windows Security
2. Virus & threat protection → Manage settings
3. Add exclusion for your project folder

## 🌐 Network Issues

### Corporate/School Network
If on corporate or school network:
- Payment gateways might be blocked
- Use personal network/mobile hotspot for testing
- Contact IT admin to whitelist Razorpay

### VPN Issues
- Some VPNs block payment gateways
- Temporarily disable VPN for testing

## 🔧 Alternative Testing Method

If Razorpay keeps getting blocked, you can test the flow with a mock payment:

### Create Mock Payment Button

Add this to PatientDashboard.tsx for testing only:

```typescript
const handleMockPayment = async (doctor: Doctor, timeSlot: string) => {
  if (!profile || !user) return;
  
  setBookingLoading(true);

  try {
    const appointmentId = await createAppointment({
      patientId: profile.patientId,
      patientName: profile.name,
      patientEmail: user.email || '',
      doctorId: doctor.doctorId,
      doctorName: doctor.name,
      doctorEmail: doctor.email,
      timeSlot: timeSlot,
      appointmentDate: new Date(),
      status: 'scheduled',
      paymentStatus: 'pending',
      amount: 500,
    });

    // Mock successful payment
    await updateAppointmentPayment(appointmentId, {
      razorpayOrderId: 'mock_order_' + Date.now(),
      razorpayPaymentId: 'mock_pay_' + Date.now(),
      razorpaySignature: 'mock_sig_' + Date.now()
    });

    await updateDoctorSlot(doctor.id, timeSlot);
    navigate(`/video-call/${appointmentId}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    setBookingLoading(false);
  }
};
```

## 📊 Verification Checklist

Before testing payment:
- [ ] Ad blocker is disabled
- [ ] Using Incognito mode OR regular mode with extensions disabled
- [ ] Browser console shows no ERR_BLOCKED_BY_CLIENT
- [ ] Razorpay script loaded successfully
- [ ] Test card details are correct
- [ ] Internet connection is stable
- [ ] Not using VPN
- [ ] Firestore rules allow write access

## 🎯 Quick Fix Commands

### Check if Razorpay Script Loads
Open browser console and run:
```javascript
console.log(typeof window.Razorpay !== 'undefined' ? 'Razorpay loaded' : 'Razorpay blocked');
```

### Manually Load Razorpay (for testing)
```javascript
const script = document.createElement('script');
script.src = 'https://checkout.razorpay.com/v1/checkout.js';
script.onload = () => console.log('Razorpay loaded successfully');
script.onerror = () => console.error('Razorpay blocked by browser');
document.body.appendChild(script);
```

## 🚨 If Nothing Works

1. **Use Different Browser**
   - Try Firefox if using Chrome
   - Try Edge if using Firefox
   - Try Safari on Mac

2. **Check Razorpay Dashboard**
   - Login to https://dashboard.razorpay.com/
   - Check if test mode is enabled
   - Verify API keys are correct

3. **Contact Support**
   - Razorpay support: support@razorpay.com
   - Include error messages and browser console logs

## ✅ Success Indicators

You'll know it's working when:
1. No red errors in console
2. Razorpay popup opens
3. Can enter card details
4. Payment processes successfully
5. Redirects to video call page
6. Slot updates in Firestore

## 🔒 For Production

When deploying to production:
1. ✅ Create backend API for order creation
2. ✅ Verify payment signatures on backend
3. ✅ Use live Razorpay credentials (not test)
4. ✅ Set up webhooks for payment notifications
5. ✅ Add proper error handling
6. ✅ Implement payment retry logic
7. ✅ Add transaction logging

---

**Most Common Fix:** Just disable your ad blocker and try again! 🎉

