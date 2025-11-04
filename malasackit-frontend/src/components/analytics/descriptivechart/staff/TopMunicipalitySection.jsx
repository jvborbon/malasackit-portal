import React from 'react';
import { HiOfficeBuilding, HiTrendingUp } from 'react-icons/hi';

const TopMunicipalitySection = () => {
  const topMunicipalities = [
    { 
      id: 1, 
      name: 'Quezon City', 
      donations: '₱1,250,000', 
      parishes: 18,
      beneficiaries: 1450,
      percentage: '+22%'
    },
    { 
      id: 2, 
      name: 'Manila City', 
      donations: '₱980,000', 
      parishes: 15,
      beneficiaries: 1200,
      percentage: '+18%'
    },
    { 
      id: 3, 
      name: 'Makati City', 
      donations: '₱850,000', 
      parishes: 12,
      beneficiaries: 980,
      percentage: '+15%'
    },
    { 
      id: 4, 
      name: 'Pasig City', 
      donations: '₱720,000', 
      parishes: 10,
      beneficiaries: 850,
      percentage: '+12%'
    },
    { 
      id: 5, 
      name: 'Taguig City', 
      donations: '₱650,000', 
      parishes: 8,
      beneficiaries: 720,
      percentage: '+8%'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className="p-1.5 bg-blue-100 rounded-lg mr-2">
            <HiOfficeBuilding className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Top Municipalities</h3>
            <p className="text-xs text-gray-500">Highest donations</p>
          </div>
        </div>
        <button className="text-blue-600 hover:text-blue-700 text-xs font-medium px-1.5 py-0.5 rounded hover:bg-blue-50">
          View All
        </button>
      </div>

      <div className="space-y-1.5">
        {topMunicipalities.map((municipality, index) => (
          <div key={municipality.id} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center min-w-0 flex-1">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                index === 0 ? 'bg-yellow-100 text-yellow-800' :
                index === 1 ? 'bg-gray-100 text-gray-600' :
                index === 2 ? 'bg-orange-100 text-orange-700' :
                'bg-green-50 text-green-600'
              }`}>
                {index + 1}
              </div>
              <div className="ml-1.5 min-w-0 flex-1">
                <p className="font-medium text-gray-900 text-xs truncate">{municipality.name}</p>
                <div className="flex items-center text-xs text-gray-500">
                  <span className="truncate">{municipality.parishes}p</span>
                  <span className="mx-1">•</span>
                  <span className="truncate">{municipality.beneficiaries}b</span>
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-1.5">
              <p className="font-semibold text-gray-900 text-xs">{municipality.donations}</p>
              <div className="flex items-center justify-end">
                <HiTrendingUp className="w-2.5 h-2.5 text-green-500 mr-0.5" />
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