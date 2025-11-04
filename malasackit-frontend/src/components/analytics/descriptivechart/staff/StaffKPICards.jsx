import React from 'react';
import { FaHandsHelping, FaDollarSign, FaUsers } from 'react-icons/fa';

const StaffKPICards = () => {
  const kpiData = [
    {
      id: 1,
      title: 'Total Worth of Response',
      value: '₱2,450,000',
      icon: <FaDollarSign className="w-8 h-8 text-red-600" />,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-600'
    },
    {
      id: 2,
      title: 'Donors Engaged',
      value: '1,234',
      icon: <FaUsers className="w-8 h-8 text-red-600" />,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-600'
    },
    {
      id: 3,
      title: 'Beneficiaries Served',
      value: '5,678',
      icon: <FaHandsHelping className="w-8 h-8 text-red-600" />,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {kpiData.map((kpi) => (
        <div
          key={kpi.id}
          className={`${kpi.bgColor} ${kpi.borderColor} border-2 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">{kpi.title}</p>
              <p className={`${kpi.textColor} text-3xl font-bold`}>{kpi.value}</p>
            </div>
            <div className={`${kpi.bgColor} p-3 rounded-lg`}>
              {kpi.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StaffKPICards;
