import React, { useEffect, useState } from 'react';
import { Search, Plus, FileDown, Trash2 } from 'lucide-react';
import { useDoctorProfile } from '../../contexts/AuthContext';
import {db} from '../../services/firebase'
import { addDoc,collection } from 'firebase/firestore';
const doctorProfile = useDoctorProfile();


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

export default function PrescriptionSystem() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [days, setDays] = useState('');
  const [timesPerDay, setTimesPerDay] = useState('');
  const [prescriptions, setPrescriptions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [patientInfo, setPatientInfo] = useState({
    patientId: '',
    patientName: '',
    age: '',
    gender: ''
  });



   useEffect(() => {
    if (location.state) {
      setPatientInfo({
        patientId: location.state.patientId || 'P' + Date.now(),
        patientName: location.state.patientName || 'Unknown Patient',
        age: location.state.age || '0',
        gender: location.state.gender || 'Not specified'
      });
    } else {
      // If no patient data provided, redirect back or show error
      console.warn('No patient data provided');
      // You can redirect back or show an error message
      // navigate('/patients');
    }
  }, [location.state]);



  // Patient and doctor info (in production, get from system/context)
  const patientInfo = {
    patientId: 'P' + Date.now(), // Get from system
    patientName: 'John Doe', // Get from system
    age: '45', // Get from system
    gender: 'Male' // Get from system
  };
  
  const doctorInfo = {
    doctorId: doctorProfile?.doctorId, // Get from Firebase Auth
    doctorName:doctorProfile?.name,
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

    const newPrescription = {
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

  const handleRemovePrescription = (id:) => {
    setPrescriptions(prescriptions.filter(p => p.id !== id));
  };

  const handleSaveToFirebase = async () => {
    if (prescriptions.length === 0) {
      alert('Please add at least one prescription');
      return;
    }

    // Firestore data structure
    const prescriptionData = {
      // Patient Information
      patientId: patientInfo.patientId,
      patientName: patientInfo.patientName,
      patientAge: patientInfo.age,
      patientGender: patientInfo.gender,
      
      // Doctor Information
      doctorId: doctorInfo.doctorId,
      doctorName: doctorInfo.doctorName,
      doctorSpecialty: doctorInfo.specialty,
      
      // Prescription Details
      medicines: prescriptions.map(p => ({
        medicineId: p.medicine.id,
        medicineName: p.medicine.name,
        medicineCategory: p.medicine.category,
        durationDays: p.days,
        timesPerDay: p.timesPerDay,
        totalDoses: p.totalDoses
      })),
      
      // Metadata
      prescriptionDate: new Date().toISOString(),
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Firebase code (uncomment in production):
    
    try {
  
      const prescriptionRef = await addDoc(collection(db, 'prescriptions'), prescriptionData);
      console.log('Prescription saved with ID:', prescriptionRef.id);
      alert('Prescription saved successfully!');
    } catch (error) {
      console.error('Error saving prescription:', error);
      alert('Error saving prescription');
    }
  

    console.log('Prescription data to save:', prescriptionData);
    alert('Prescription saved! (Check console for data structure)');
  };

  const handleExportPDF = () => {
    // In production, use jsPDF or similar library
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <h1 className="text-3xl font-bold">Doctor Prescription System</h1>
          <p className="text-blue-100 mt-1">Create and manage patient prescriptions</p>
        </div>

        <div className="p-6">
          {/* Patient Information Display */}
          <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Patient Information</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Patient ID</p>
                <p className="text-base font-semibold text-gray-900">{patientInfo.patientId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Patient Name</p>
                <p className="text-base font-semibold text-gray-900">{patientInfo.patientName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Age</p>
                <p className="text-base font-semibold text-gray-900">{patientInfo.age} years</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Gender</p>
                <p className="text-base font-semibold text-gray-900">{patientInfo.gender}</p>
              </div>
            </div>
          </div>

          {/* Add Prescription Form */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Medicine Search */}
            <div className="md:col-span-2 relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Medicine
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search medicine..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              
              {/* Dropdown */}
              {showDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                  {searchTerm === '' ? (
                    // Show all medicines when input is empty
                    MEDICINES.map(med => (
                      <div
                        key={med.id}
                        onClick={() => {
                          setSelectedMedicine(med);
                          setSearchTerm(med.name);
                          setShowDropdown(false);
                        }}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{med.name}</div>
                        <div className="text-sm text-gray-500">{med.category}</div>
                      </div>
                    ))
                  ) : (
                    // Show filtered medicines when searching
                    filteredMedicines.length > 0 ? (
                      filteredMedicines.map(med => (
                        <div
                          key={med.id}
                          onClick={() => {
                            setSelectedMedicine(med);
                            setSearchTerm(med.name);
                            setShowDropdown(false);
                          }}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">{med.name}</div>
                          <div className="text-sm text-gray-500">{med.category}</div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-gray-500">No medicines found</div>
                    )
                  )}
                </div>
              )}
              
              {selectedMedicine && (
                <div className="mt-2 text-sm text-green-600 font-medium">
                  Selected: {selectedMedicine.name}
                </div>
              )}
            </div>

            {/* Days Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (Days)
              </label>
              <input
                type="number"
                placeholder="e.g., 7"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Times per Day Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Times/Day
              </label>
              <input
                type="number"
                placeholder="e.g., 3"
                value={timesPerDay}
                onChange={(e) => setTimesPerDay(e.target.value)}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Add Button */}
          <button
            onClick={handleAddPrescription}
            className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 font-medium mb-6"
          >
            <Plus size={20} />
            Add to Prescription
          </button>

          {/* Prescriptions Table */}
          {prescriptions.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Prescription Summary</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-3 text-left">#</th>
                      <th className="border border-gray-300 px-4 py-3 text-left">Medicine Name</th>
                      <th className="border border-gray-300 px-4 py-3 text-left">Category</th>
                      <th className="border border-gray-300 px-4 py-3 text-center">Days</th>
                      <th className="border border-gray-300 px-4 py-3 text-center">Times/Day</th>
                      <th className="border border-gray-300 px-4 py-3 text-center">Total Doses</th>
                      <th className="border border-gray-300 px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptions.map((prescription, index) => (
                      <tr key={prescription.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3">{index + 1}</td>
                        <td className="border border-gray-300 px-4 py-3 font-medium">
                          {prescription.medicine.name}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-sm text-gray-600">
                          {prescription.medicine.category}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center">
                          {prescription.days}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center">
                          {prescription.timesPerDay}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center font-semibold">
                          {prescription.totalDoses}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center">
                          <button
                            onClick={() => handleRemovePrescription(prescription.id)}
                            className="text-red-600 hover:text-red-800 transition"
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
              <div className="flex flex-col md:flex-row gap-4 mt-6">
                <button
                  onClick={handleSaveToFirebase}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  Save to Database
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2 font-medium"
                >
                  <FileDown size={20} />
                  Export Prescription
                </button>
              </div>
            </div>
          )}

          {prescriptions.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg">No prescriptions added yet</p>
              <p className="text-sm">Add medicines using the form above</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}