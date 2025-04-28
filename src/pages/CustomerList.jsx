import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 Import useNavigate

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [totalRegistrations, setTotalRegistrations] = useState(0);
  const navigate = useNavigate(); // 👈 Initialize navigate

  useEffect(() => {
    fetch('http://localhost:8000/api/customers')
      .then((res) => res.json())
      .then((data) => {
        console.log('Fetched data:', data);
        setCustomers(Array.isArray(data) ? data : []);
        setTotalRegistrations(Array.isArray(data) ? data.length : 0);
      })
      .catch((err) => {
        console.error('Error fetching customers:', err);
        setCustomers([]);
        setTotalRegistrations(0);
      });
  }, []);

  const handleReportClick = () => {
    navigate('/RegistrationReport'); 
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          Registered Customers (Total: {totalRegistrations})
        </h2>
        <button
          onClick={handleReportClick}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
        >
          Reports
        </button>
      </div>

      <table className="min-w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">First Name</th>
            <th className="border p-2">Last Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Username</th>
          </tr>
        </thead>
        <tbody>
          {customers.length > 0 ? (
            customers.map((customer, index) => (
              <tr key={index} className="text-center">
                <td className="border p-2">{customer.f_name}</td>
                <td className="border p-2">{customer.l_name}</td>
                <td className="border p-2">{customer.email}</td>
                <td className="border p-2">{customer.username}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="border p-2 text-center">
                No customers found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerList;
