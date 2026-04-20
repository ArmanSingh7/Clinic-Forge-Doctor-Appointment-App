const indianCities = [
  'Agra', 'Ahmedabad', 'Allahabad', 'Amritsar', 'Aurangabad',
  'Bangalore', 'Bhopal', 'Bhubaneswar', 'Chandigarh', 'Chennai',
  'Coimbatore', 'Dehradun', 'Delhi', 'Faridabad', 'Ghaziabad',
  'Goa', 'Gurgaon', 'Guwahati', 'Hyderabad', 'Indore',
  'Jaipur', 'Jalandhar', 'Jammu', 'Jamshedpur', 'Jodhpur',
  'Kanpur', 'Kochi', 'Kolkata', 'Lucknow', 'Ludhiana',
  'Madurai', 'Mangalore', 'Meerut', 'Mumbai', 'Mysore',
  'Nagpur', 'Nashik', 'Noida', 'Patna', 'Pune',
  'Raipur', 'Rajkot', 'Ranchi', 'Salem', 'Shimla',
  'Srinagar', 'Surat', 'Thiruvananthapuram', 'Tiruchirappalli', 'Udaipur',
  'Vadodara', 'Varanasi', 'Vijayawada', 'Visakhapatnam', 'Warangal',
];

export { indianCities };

export default function CitySelect({ value, onChange, name = 'city', className = 'form-select', required = false }) {
  return (
    <select className={className} name={name} value={value || ''} onChange={onChange} required={required}>
      <option value="">Select City</option>
      {indianCities.map(city => (
        <option key={city} value={city}>{city}</option>
      ))}
    </select>
  );
}
