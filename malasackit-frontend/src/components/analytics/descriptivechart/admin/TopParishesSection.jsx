import React from 'react';
import { HiLocationMarker, HiTrendingUp } from 'react-icons/hi';

const TopParishesSection = () => {
  const topParishes = [
    { 
      id: 1, 
      name: 'St. Mary Cathedral', 
      donations: '₱485,000', 
      donors: 124,
      staff: 8,
      percentage: '+15%'
    },
    { 
      id: 2, 
      name: 'Holy Spirit Parish', 
      donations: '₱420,000', 
      donors: 98,
      staff: 6,
      percentage: '+12%'
    },
    { 
      id: 3, 
      name: 'Sacred Heart Church', 
      donations: '₱380,000', 
      donors: 87,
      staff: 5,
      percentage: '+8%'
    },
    { 
      id: 4, 
      name: 'Our Lady of Peace', 
      donations: '₱325,000', 
      donors: 76,
      staff: 4,
      percentage: '+5%'
    },
    { 
      id: 5, 
      name: 'St. Joseph Parish', 
      donations: '₱290,000', 
      donors: 65,
      staff: 4,
      percentage: '+3%'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className="p-1.5 bg-red-100 rounded-lg mr-2">
            <HiLocationMarker className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Top Parishes</h3>
            <p className="text-xs text-gray-500">Highest performing parishes</p>
          </div>
        </div>
        <button className="text-red-600 hover:text-red-700 text-xs font-medium px-1.5 py-0.5 rounded hover:bg-red-50">
          View All
        </button>
      </div>

      <div className="space-y-1.5">
        {topParishes.map((parish, index) => (
          <div key={parish.id} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center min-w-0 flex-1">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                index === 0 ? 'bg-yellow-100 text-yellow-800' :
                index === 1 ? 'bg-gray-100 text-gray-600' :
                index === 2 ? 'bg-orange-100 text-orange-700' :
                'bg-blue-50 text-blue-600'
              }`}>
                {index + 1}
              </div>
              <div className="ml-1.5 min-w-0 flex-1">
                <p className="font-medium text-gray-900 text-xs truncate">{parish.name}</p>
                <div className="flex items-center text-xs text-gray-500">
                  <span className="truncate">{parish.donors}d</span>
                  <span className="mx-1">•</span>
                  <span className="truncate">{parish.staff}s</span>
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              <p className="font-semibold text-gray-900 text-sm">{parish.donations}</p>
              <div className="flex items-center justify-end">
                <HiTrendingUp className="w-3 h-3 text-green-500 mr-0.5" />
                <span className="text-xs text-green-600 font-medium">{parish.percentage}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopParishesSection;