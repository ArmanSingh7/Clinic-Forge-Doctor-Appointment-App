const specializations = [
  'Physician',
  'Cardiologist',
  'Dermatologist',
  'Dentist',
  'ENT Specialist',
  'Gastroenterologist',
  'Gynecologist',
  'Neurologist',
  'Oncologist',
  'Ophthalmologist',
  'Orthopedic',
  'Pediatrician',
  'Psychiatrist',
  'Pulmonologist',
  'Radiologist',
  'Surgeon',
  'Urologist',
];

export { specializations };

export default function SpecializationSelect({ value, onChange, name = 'speciality', className = 'form-select', required = false }) {
  return (
    <select className={className} name={name} value={value || ''} onChange={onChange} required={required}>
      <option value="">Select Specialization</option>
      {specializations.map(s => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}
