import React from 'react';
import { FaHeart } from 'react-icons/fa';
import { HiTrendingUp } from 'react-icons/hi';

const TopDonorsSection = () => {
  const topDonors = [
    {
      id: 1,
      name: 'M***** S*****',
      amount: '₱***,***',
      donations: 24,
      percentage: '+15%',
      avatar: 'MS',
      color: 'bg-red-500'
    },
    {
      id: 2,
      name: 'J*** D*** C***',
      amount: '₱***,***',
      donations: 18,
      percentage: '+12%',
      avatar: 'JD',
      color: 'bg-red-400'
    },
    {
      id: 3,
      name: 'A** R********',
      amount: '₱***,***',
      donations: 15,
      percentage: '+8%',
      avatar: 'AR',
      color: 'bg-red-900'
    },
    {
      id: 4,
      name: 'R****** C***',
      amount: '₱***,***',
      donations: 12,
      percentage: '+5%',
      avatar: 'RC',
      color: 'bg-red-300'
    },
    {
      id: 5,
      name: 'E**** G*****',
      amount: '₱***,***',
      donations: 9,
      percentage: '+3%',
      avatar: 'EG',
      color: 'bg-red-700'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className="p-1.5 bg-red-900/10 rounded-lg mr-2">
            <FaHeart className="w-5 h-5 text-red-900" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Top Donors</h3>
            <p className="text-xs text-gray-500">Highest donations</p>
          </div>
        </div>
        <button className="text-red-900 hover:text-red-700 text-xs font-medium px-1.5 py-0.5 rounded hover:bg-red-50">
          View All
        </button>
      </div>

      <div className="space-y-1.5">
        {topDonors.map((donor) => (
          <div key={donor.id} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center min-w-0 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white ${donor.color} mr-1.5`}>
                {donor.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 text-xs truncate">{donor.name}</p>
                <p className="text-xs text-gray-500 truncate">{donor.donations} donations</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-1.5">
              <p className="font-semibold text-gray-900 text-xs">{donor.amount}</p>
              <div className="flex items-center justify-end">
                <HiTrendingUp className="w-2.5 h-2.5 text-green-500 mr-0.5" />
                <span className="text-xs text-green-600 font-medium">{donor.percentage}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopDonorsSection;
