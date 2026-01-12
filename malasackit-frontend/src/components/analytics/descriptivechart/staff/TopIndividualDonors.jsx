import React, { useState, useEffect } from 'react';
import { FaUser } from 'react-icons/fa';
import { HiTrendingUp, HiX } from 'react-icons/hi';

const TopIndividualDonors = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [allDonors, setAllDonors] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    const fetchTopDonors = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/donations/top-individual-donors?limit=5`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch top individual donors');
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          setDonors(result.data);
        }
      } catch (err) {
        console.error('Error fetching top individual donors:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTopDonors();
  }, []);

  const getInitials = (fullName) => {
    const names = fullName?.split(' ') || [];
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
    }
    return fullName?.substring(0, 2).toUpperCase() || 'DN';
  };

  const maskName = (fullName) => {
    const names = fullName?.split(' ') || [];
    if (names.length >= 2) {
      const firstMasked = names[0].charAt(0) + '*'.repeat(Math.max(0, names[0].length - 1));
      const lastMasked = names[names.length - 1].charAt(0) + '*'.repeat(Math.max(0, names[names.length - 1].length - 1));
      return `${firstMasked} ${lastMasked}`;
    }
    return fullName?.charAt(0) + '*'.repeat(Math.max(0, fullName.length - 1)) || 'Unknown';
  };

  const colors = ['bg-red-500', 'bg-red-400', 'bg-red-900', 'bg-red-300', 'bg-red-700'];

  const fetchAllDonors = async () => {
    try {
      setModalLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/donations/top-individual-donors?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch all donors');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setAllDonors(result.data);
      }
    } catch (err) {
      console.error('Error fetching all donors:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleViewAll = () => {
    setShowModal(true);
    fetchAllDonors();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className="p-1.5 bg-red-900/10 rounded-lg mr-2">
            <FaUser className="w-5 h-5 text-red-900" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Top Individual Donors</h3>
            <p className="text-xs text-gray-500">Highest donations</p>
          </div>
        </div>
        <button 
          onClick={handleViewAll}
          className="text-red-900 hover:text-red-700 text-xs font-medium px-1.5 py-0.5 rounded hover:bg-red-50"
        >
          View All
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-900"></div>
        </div>
      ) : error ? (
        <div className="text-center py-4 text-xs text-gray-500">
          Failed to load donors
        </div>
      ) : donors.length === 0 ? (
        <div className="text-center py-4 text-xs text-gray-500">
          No donors yet
        </div>
      ) : (
        <div className="space-y-1.5">
          {donors.map((donor, index) => (
            <div key={donor.user_id} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center min-w-0 flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white ${colors[index % colors.length]} mr-1.5`}>
                  {getInitials(donor.full_name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 text-xs truncate">
                    {maskName(donor.full_name)}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{donor.total_donations} donations</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-1.5">
                <p className="font-semibold text-gray-900 text-xs">
                  ₱{parseFloat(donor.total_value).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for All Donors */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-red-900/10 rounded-lg mr-3">
                  <FaUser className="w-6 h-6 text-red-900" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">All Individual Donors</h2>
                  <p className="text-sm text-gray-500">Complete ranking by donation value</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {modalLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-900"></div>
                </div>
              ) : allDonors.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No donors found
                </div>
              ) : (
                <div className="space-y-2">
                  {allDonors.map((donor, index) => (
                    <div key={donor.user_id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center min-w-0 flex-1">
                        <div className="text-lg font-bold text-gray-400 mr-4 w-8">
                          #{index + 1}
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 text-white ${colors[index % colors.length]} mr-3`}>
                          {getInitials(donor.full_name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 truncate">
                            {maskName(donor.full_name)}
                          </p>
                          <p className="text-sm text-gray-500">{donor.total_donations} donations</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className="font-bold text-gray-900 text-lg">
                          ₱{parseFloat(donor.total_value).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopIndividualDonors;
