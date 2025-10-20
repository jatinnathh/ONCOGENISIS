import React, { useState } from 'react';
import './DoctorCard.css'; 

// 1. Define the updated TypeScript interface for the Doctor data
interface Doctor {
  id: number;
  name: string;
  qualification: string;
  specialty: string;
  expertise: string;
  experienceYears: number;
  photoUrl: string;
  // NEW: Array of available time slots
  availableSlots: string[]; 
}

// 2. Define the updated props for the DoctorCard component
interface DoctorCardProps {
  doctor: Doctor; 
  // Handler now accepts both ID and the selected slot
  onSlotClick: (doctorId: number, timeSlot: string) => void;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ 
  doctor, 
  onSlotClick 
}) => {
  const { 
    id, 
    name, 
    qualification, 
    specialty, 
    expertise, 
    experienceYears, 
    photoUrl,
    availableSlots // Destructure the new slot array
  } = doctor;

  // State to track the locally selected slot before confirmation (Optional, but good UX)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const handleSlotClick = (slot: string) => {
    setSelectedSlot(slot);
    // Immediately trigger the parent handler to proceed with the booking logic
    onSlotClick(id, slot);
  };
  
  const handlePhotoError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // Fallback image if photoUrl is broken (optional but recommended)
    e.currentTarget.src = 'https://via.placeholder.com/70x70.png?text=DR';
  };

  return (
    <div className="doctor-card">
      <div className="card-header">
        <div className="doctor-photo-container">
          <img 
            src={photoUrl} 
            alt={`Photo of Dr. ${name}`} 
            className="doctor-photo" 
            onError={handlePhotoError}
          />
        </div>
        <div className="doctor-name-info">
          <h3 className="doctor-name">Dr. {name}</h3>
          <p className="doctor-qualification">{qualification}</p>
        </div>
      </div>
      
      <div className="card-body">
        {/* ... Existing Details ... */}
        <div className="detail-item">
          <span className="label">Specialist:</span>
          <span className="value specialist">{specialty}</span>
        </div>
        
        <div className="detail-item">
          <span className="label">Expertise:</span>
          <span className="value">{expertise}</span>
        </div>
        
        <div className="detail-item detail-no-border">
          <span className="label">Experience:</span>
          <span className="value experience">{experienceYears}+ Years</span>
        </div>
        
        {/* NEW: Time Slots Section */}
        <div className="time-slots-section">
            <span className="label slots-label">Available Slots Today:</span>
            <div className="slots-container">
                {availableSlots.map(slot => (
                    <button 
                        key={slot}
                        className={`slot-button ${selectedSlot === slot ? 'selected' : ''}`}
                        onClick={() => handleSlotClick(slot)}
                        title={`Book appointment at ${slot}`}
                    >
                        {slot}
                    </button>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;

// ----------------------------------------------------------------------
// 3. Reusable Component to render an Array of Cards (DoctorList)
// ----------------------------------------------------------------------

interface DoctorListProps {
    doctors: Doctor[];
    // Pass the slot handler down
    onSlotClick: (doctorId: number, timeSlot: string) => void;
}

export const DoctorList: React.FC<DoctorListProps> = ({ doctors, onSlotClick }) => {
    return (
        <div className="doctor-list-container">
            {doctors.map(doctor => (
                <DoctorCard 
                    key={doctor.id} 
                    doctor={doctor} 
                    onSlotClick={onSlotClick}
                />
            ))}
        </div>
    );
}