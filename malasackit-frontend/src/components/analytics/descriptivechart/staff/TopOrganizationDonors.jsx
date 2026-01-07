import React, { useState, useEffect } from 'react';
import { FaBuilding } from 'react-icons/fa';
import { HiTrendingUp, HiX } from 'react-icons/hi';

const TopOrganizationDonors = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [allOrganizations, setAllOrganizations] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    const fetchTopOrganizations = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/donations/top-organization-donors?limit=5', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch top organization donors');
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          setOrganizations(result.data);
        }
      } catch (err) {
        console.error('Error fetching top organization donors:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTopOrganizations();
  }, []);

  const getInitials = (orgName) => {
    const words = orgName?.split(' ') || [];
    if (words.length >= 2) {
      return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
    }
    return orgName?.substring(0, 2).toUpperCase() || 'OR';
  };

  const colors = ['bg-blue-500', 'bg-blue-400', 'bg-blue-600', 'bg-blue-300', 'bg-blue-700'];

  const fetchAllOrganizations = async () => {
    try {
      setModalLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/donations/top-organization-donors?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch all organizations');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setAllOrganizations(result.data);
      }
    } catch (err) {
      console.error('Error fetching all organizations:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleViewAll = () => {
    setShowModal(true);
    fetchAllOrganizations();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className="p-1.5 bg-blue-100 rounded-lg mr-2">
            <FaBuilding className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Top Organizations</h3>
            <p className="text-xs text-gray-500">Highest donations</p>
          </div>
        </div>
        <button 
          onClick={handleViewAll}
          className="text-blue-600 hover:text-blue-700 text-xs font-medium px-1.5 py-0.5 rounded hover:bg-blue-50"
        >
          View All
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-4 text-xs text-gray-500">
          Failed to load organizations
        </div>
      ) : organizations.length === 0 ? (
        <div className="text-center py-4 text-xs text-gray-500">
          No organizations yet
        </div>
      ) : (
        <div className="space-y-1.5">
          {organizations.map((org, index) => (
            <div key={org.user_id} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center min-w-0 flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white ${colors[index % colors.length]} mr-1.5`}>
                  {getInitials(org.organization_name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 text-xs truncate">
                    {org.organization_name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{org.total_donations} donations</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-1.5">
                <p className="font-semibold text-gray-900 text-xs">
                  ₱{parseFloat(org.total_value).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for All Organizations */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <FaBuilding className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">All Organization Donors</h2>
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
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : allOrganizations.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No organizations found
                </div>
              ) : (
                <div className="space-y-2">
                  {allOrganizations.map((org, index) => (
                    <div key={org.user_id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center min-w-0 flex-1">
                        <div className="text-lg font-bold text-gray-400 mr-4 w-8">
                          #{index + 1}
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 text-white ${colors[index % colors.length]} mr-3`}>
                          {getInitials(org.organization_name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 truncate">
                            {org.organization_name}
                          </p>
                          <p className="text-sm text-gray-500">{org.total_donations} donations</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className="font-bold text-gray-900 text-lg">
                          ₱{parseFloat(org.total_value).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

export default TopOrganizationDonors;
