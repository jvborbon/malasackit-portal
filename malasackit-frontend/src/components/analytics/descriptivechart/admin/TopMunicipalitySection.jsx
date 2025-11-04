import React from 'react';
import { HiOfficeBuilding, HiTrendingUp } from 'react-icons/hi';

const TopMunicipalitySection = () => {
  const topMunicipalities = [
    { 
      id: 1, 
      name: 'Quezon City', 
      donations: '₱1,250,000', 
      parishes: 18,
      activeStaff: 45,
      totalUsers: 2650,
      percentage: '+22%'
    },
    { 
      id: 2, 
      name: 'Manila City', 
      donations: '₱980,000', 
      parishes: 15,
      activeStaff: 38,
      totalUsers: 2200,
      percentage: '+18%'
    },
    { 
      id: 3, 
      name: 'Makati City', 
      donations: '₱850,000', 
      parishes: 12,
      activeStaff: 32,
      totalUsers: 1980,
      percentage: '+15%'
    },
    { 
      id: 4, 
      name: 'Pasig City', 
      donations: '₱720,000', 
      parishes: 10,
      activeStaff: 28,
      totalUsers: 1650,
      percentage: '+12%'
    },
    { 
      id: 5, 
      name: 'Taguig City', 
      donations: '₱650,000', 
      parishes: 8,
      activeStaff: 22,
      totalUsers: 1420,
      percentage: '+8%'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="p-1.5 bg-blue-100 rounded-lg mr-2">
            <HiOfficeBuilding className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Top Municipalities</h3>
            <p className="text-xs text-gray-500">Cities with highest adoption</p>
          </div>
        </div>
        <button className="text-blue-600 hover:text-blue-700 text-xs font-medium px-2 py-1 rounded hover:bg-blue-50">
          Manage All
        </button>
      </div>

      <div className="space-y-2">
        {topMunicipalities.map((municipality, index) => (
          <div key={municipality.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center min-w-0 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                index === 0 ? 'bg-yellow-100 text-yellow-800' :
                index === 1 ? 'bg-gray-100 text-gray-600' :
                index === 2 ? 'bg-orange-100 text-orange-700' :
                'bg-green-50 text-green-600'
              }`}>
                {index + 1}
              </div>
              <div className="ml-2 min-w-0 flex-1">
                <p className="font-medium text-gray-900 text-sm truncate">{municipality.name}</p>
                <div className="flex items-center text-xs text-gray-500">
                  <span className="truncate">{municipality.parishes}p</span>
                  <span className="mx-1">•</span>
                  <span className="truncate">{municipality.activeStaff}s</span>
                  <span className="mx-1">•</span>
                  <span className="truncate">{municipality.totalUsers}u</span>
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              <p className="font-semibold text-gray-900 text-sm">{municipality.donations}</p>
              <div className="flex items-center justify-end">
                <HiTrendingUp className="w-3 h-3 text-green-500 mr-0.5" />
                <span className="text-xs text-green-600 font-medium">{municipality.percentage}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopMunicipalitySection;