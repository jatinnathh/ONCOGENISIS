import React, { useEffect, useState } from 'react';
import { Search, Plus, FileDown, Trash2 } from 'lucide-react';
import { useDoctorProfile } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import { addDoc, collection } from 'firebase/firestore';
import './prescription.css';

// Medicine database - in production, import this from a separate file
const MEDICINES = [
  { id: 1, name: 'Paclitaxel', category: 'Chemotherapy' },
  { id: 2, name: 'Carboplatin', category: 'Chemotherapy' },
  { id: 3, name: 'Cisplatin', category: 'Chemotherapy' },
  { id: 4, name: 'Doxorubicin', category: 'Chemotherapy' },
  { id: 5, name: 'Cyclophosphamide', category: 'Chemotherapy' },
  { id: 6, name: 'Fluorouracil (5-FU)', category: 'Chemotherapy' },
  { id: 7, name: 'Methotrexate', category: 'Chemotherapy' },
  { id: 8, name: 'Vincristine', category: 'Chemotherapy' },
  { id: 9, name: 'Irinotecan', category: 'Chemotherapy' },
  { id: 10, name: 'Oxaliplatin', category: 'Chemotherapy' },
  { id: 11, name: 'Pembrolizumab (Keytruda)', category: 'Immunotherapy' },
  { id: 12, name: 'Nivolumab (Opdivo)', category: 'Immunotherapy' },
  { id: 13, name: 'Trastuzumab (Herceptin)', category: 'Targeted Therapy' },
  { id: 14, name: 'Rituximab (Rituxan)', category: 'Targeted Therapy' },
  { id: 15, name: 'Imatinib (Gleevec)', category: 'Targeted Therapy' },
  { id: 16, name: 'Erlotinib (Tarceva)', category: 'Targeted Therapy' },
  { id: 17, name: 'Tamoxifen', category: 'Hormone Therapy' },
  { id: 18, name: 'Anastrozole (Arimidex)', category: 'Hormone Therapy' },
  { id: 19, name: 'Ondansetron (Zofran)', category: 'Supportive Care' },
  { id: 20, name: 'Filgrastim (Neupogen)', category: 'Supportive Care' }
];

interface PatientData {
  id: string;
  name: string;
  age: string;
  gender: string;
}

interface PrescriptionSystemProps {
  patientData?: PatientData;
}

interface Medicine {
  id: number;
  name: string;
  category: string;
}

interface Prescription {
  id: number;
  medicine: Medicine;
  days: number;
  timesPerDay: number;
  totalDoses: number;
}

export default function PrescriptionSystem({ patientData }: PrescriptionSystemProps) {
  const doctorProfile = useDoctorProfile();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [days, setDays] = useState('');
  const [timesPerDay, setTimesPerDay] = useState('');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [patientInfo, setPatientInfo] = useState({
    patientId: '',
    patientName: '',
    age: '',
    gender: ''
  });

  useEffect(() => {
    if (patientData) {
      setPatientInfo({
        patientId: patientData.id || 'P' + Date.now(),
        patientName: patientData.name || 'Unknown',
        age: patientData.age || '0',
        gender: patientData.gender || 'Not specified'
      });
    } else {
      console.warn('No patient data provided');
    }
  }, [patientData]);

  const doctorInfo = {
    doctorId: doctorProfile?.doctorId,
    doctorName: doctorProfile?.name,
    specialty: doctorProfile?.specialization
  };

  const filteredMedicines = MEDICINES.filter(med =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPrescription = () => {
    if (!selectedMedicine || !days || !timesPerDay) {
      alert('Please fill all fields');
      return;
    }

    const newPrescription: Prescription = {
      id: Date.now(),
      medicine: selectedMedicine,
      days: parseInt(days),
      timesPerDay: parseInt(timesPerDay),
      totalDoses: parseInt(days) * parseInt(timesPerDay)
    };

    setPrescriptions([...prescriptions, newPrescription]);
    setSelectedMedicine(null);
    setSearchTerm('');
    setDays('');
    setTimesPerDay('');
    setShowDropdown(false);
  };

  const handleRemovePrescription = (id: number) => {
    setPrescriptions(prescriptions.filter(p => p.id !== id));
  };

  const handleSaveToFirebase = async () => {
    if (prescriptions.length === 0) {
      alert('Please add at least one prescription');
      return;
    }

    const prescriptionData = {
      patientId: patientInfo.patientId,
      patientName: patientInfo.patientName,
      patientAge: patientInfo.age,
      patientGender: patientInfo.gender,
      
      doctorId: doctorInfo.doctorId,
      doctorName: doctorInfo.doctorName,
      doctorSpecialty: doctorInfo.specialty,
      
      medicines: prescriptions.map(p => ({
        medicineId: p.medicine.id,
        medicineName: p.medicine.name,
        medicineCategory: p.medicine.category,
        durationDays: p.days,
        timesPerDay: p.timesPerDay,
        totalDoses: p.totalDoses
      })),
      
      prescriptionDate: new Date().toISOString(),
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const prescriptionRef = await addDoc(collection(db, 'prescriptions'), prescriptionData);
      console.log('Prescription saved with ID:', prescriptionRef.id);
      alert('Prescription saved successfully!');
    } catch (error) {
      console.error('Error saving prescription:', error);
      alert('Error saving prescription');
    }
  };

  const handleExportPDF = () => {
    const content = `
PRESCRIPTION
${'='.repeat(50)}

Patient Information:
Name: ${patientInfo.patientName}
ID: ${patientInfo.patientId}
Age: ${patientInfo.age}
Gender: ${patientInfo.gender}

Doctor Information:
Name: ${doctorInfo.doctorName}
Specialty: ${doctorInfo.specialty}
ID: ${doctorInfo.doctorId}

Date: ${new Date().toLocaleDateString()}

${'='.repeat(50)}

PRESCRIBED MEDICINES:

${prescriptions.map((p, i) => `
${i + 1}. ${p.medicine.name}
   Category: ${p.medicine.category}
   Duration: ${p.days} days
   Frequency: ${p.timesPerDay} times per day
   Total Doses: ${p.totalDoses}
`).join('\n')}

${'='.repeat(50)}

Doctor's Signature: _____________________
Date: ${new Date().toLocaleDateString()}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prescription_${patientInfo.patientId}_${Date.now()}.txt`;
    a.click();
  };

  return (
    <div className="prescription-container">
      <div className="prescription-wrapper">
        {/* Header */}
        <div className="prescription-header">
          <h1>Doctor Prescription System</h1>
          <p>Create and manage patient prescriptions</p>
        </div>

        <div className="prescription-content">
          {/* Patient Information Display */}
          <div className="patient-info-section">
            <h2>Patient Information</h2>
            <div className="patient-info-grid">
              <div className="patient-info-item">
                <p>Patient ID</p>
                <p>{patientInfo.patientId}</p>
              </div>
              <div className="patient-info-item">
                <p>Patient Name</p>
                <p>{patientInfo.patientName}</p>
              </div>
              <div className="patient-info-item">
                <p>Age</p>
                <p>{patientInfo.age} years</p>
              </div>
              <div className="patient-info-item">
                <p>Gender</p>
                <p>{patientInfo.gender}</p>
              </div>
            </div>
          </div>

          {/* Add Prescription Form */}
          <div className="prescription-form">
            {/* Medicine Search */}
            <div className="form-field form-field-wide">
              <label className="form-label">Search Medicine</label>
              <div className="form-input-wrapper">
                <Search className="input-icon" size={20} />
                <input
                  type="text"
                  placeholder="Search medicine..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="form-input"
                />
              </div>
              
              {/* Dropdown */}
              {showDropdown && (
                <div className="medicine-dropdown">
                  {searchTerm === '' ? (
                    MEDICINES.map(med => (
                      <div
                        key={med.id}
                        onClick={() => {
                          setSelectedMedicine(med);
                          setSearchTerm(med.name);
                          setShowDropdown(false);
                        }}
                        className="dropdown-item"
                      >
                        <div className="dropdown-medicine-name">{med.name}</div>
                        <div className="dropdown-medicine-category">{med.category}</div>
                      </div>
                    ))
                  ) : (
                    filteredMedicines.length > 0 ? (
                      filteredMedicines.map(med => (
                        <div
                          key={med.id}
                          onClick={() => {
                            setSelectedMedicine(med);
                            setSearchTerm(med.name);
                            setShowDropdown(false);
                          }}
                          className="dropdown-item"
                        >
                          <div className="dropdown-medicine-name">{med.name}</div>
                          <div className="dropdown-medicine-category">{med.category}</div>
                        </div>
                      ))
                    ) : (
                      <div className="dropdown-no-results">No medicines found</div>
                    )
                  )}
                </div>
              )}
              
              {selectedMedicine && (
                <div className="selected-medicine-text">
                  Selected: {selectedMedicine.name}
                </div>
              )}
            </div>

            {/* Days Input */}
            <div className="form-field">
              <label className="form-label">Duration (Days)</label>
              <input
                type="number"
                placeholder="e.g., 7"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                min="1"
                className="form-input form-input-simple"
              />
            </div>

            {/* Times per Day Input */}
            <div className="form-field">
              <label className="form-label">Times/Day</label>
              <input
                type="number"
                placeholder="e.g., 3"
                value={timesPerDay}
                onChange={(e) => setTimesPerDay(e.target.value)}
                min="1"
                className="form-input form-input-simple"
              />
            </div>
          </div>

          {/* Add Button */}
          <button onClick={handleAddPrescription} className="add-prescription-btn">
            <Plus size={20} />
            Add to Prescription
          </button>

          {/* Prescriptions Table */}
          {prescriptions.length > 0 && (
            <div className="prescription-summary">
              <h2>Prescription Summary</h2>
              <div className="prescription-table-wrapper">
                <table className="prescription-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Medicine Name</th>
                      <th>Category</th>
                      <th className="text-center">Days</th>
                      <th className="text-center">Times/Day</th>
                      <th className="text-center">Total Doses</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptions.map((prescription, index) => (
                      <tr key={prescription.id}>
                        <td>{index + 1}</td>
                        <td className="medicine-name">{prescription.medicine.name}</td>
                        <td className="medicine-category">{prescription.medicine.category}</td>
                        <td className="text-center">{prescription.days}</td>
                        <td className="text-center">{prescription.timesPerDay}</td>
                        <td className="text-center total-doses">{prescription.totalDoses}</td>
                        <td className="text-center">
                          <button
                            onClick={() => handleRemovePrescription(prescription.id)}
                            className="delete-btn"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons">
                <button onClick={handleSaveToFirebase} className="save-btn">
                  Save to Database
                </button>
                <button onClick={handleExportPDF} className="export-btn">
                  <FileDown size={20} />
                  Export Prescription
                </button>
              </div>
            </div>
          )}

          {prescriptions.length === 0 && (
            <div className="empty-state">
              <p>No prescriptions added yet</p>
              <p>Add medicines using the form above</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}