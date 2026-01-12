import React, { useState, useEffect } from 'react';
import { FaHandsHelping, FaMoneyBillWave, FaUsers, FaGift } from 'react-icons/fa';
import dashboardService from '../../../../services/dashboardService';

const StaffKPICards = () => {
  const [kpiData, setKpiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKPIData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await dashboardService.getStaffKPIMetrics();
        
        if (response.success) {
          const { totalWorth, donorsEngaged, beneficiariesServed, totalWorthResponse } = response.data;
          
          const formattedKpiData = [
            {
              id: 1,
              title: 'Total Worth of Donations Received',
              value: dashboardService.formatCurrency(totalWorth),
              rawValue: totalWorth,
              icon: <FaMoneyBillWave className="w-8 h-8 text-red-900" />,
              bgColor: 'bg-white',
              borderColor: '',
              textColor: 'text-gray-900',
              headerColor: 'text-red-900'
            },
            {
              id: 2,
              title: 'Donors Engaged',
              value: dashboardService.formatNumber(donorsEngaged),
              rawValue: donorsEngaged,
              icon: <FaUsers className="w-8 h-8 text-red-900" />,
              bgColor: 'bg-white',
              borderColor: '',
              textColor: 'text-gray-900',
              headerColor: 'text-red-900'
            },
            {
              id: 3,
              title: 'Beneficiaries Served',
              value: dashboardService.formatNumber(beneficiariesServed),
              rawValue: beneficiariesServed,
              icon: <FaHandsHelping className="w-8 h-8 text-red-900" />,
              bgColor: 'bg-white',
              borderColor: '',
              textColor: 'text-gray-900',
              headerColor: 'text-red-900'
            },
            {
              id: 4,
              title: 'Total Worth of Response',
              value: dashboardService.formatCurrency(totalWorthResponse),
              rawValue: totalWorthResponse,
              icon: <FaGift className="w-8 h-8 text-red-900" />,
              bgColor: 'bg-white',
              borderColor: '',
              textColor: 'text-gray-900',
              headerColor: 'text-red-900'
            }
          ];
          
          setKpiData(formattedKpiData);
        } else {
          throw new Error(response.message || 'Failed to fetch KPI data');
        }
      } catch (error) {
        console.error('Error fetching KPI data:', error);
        setError(error.message);
        
        // Set default/fallback data
        const fallbackKpiData = [
          {
            id: 1,
            title: 'Total Worth of Donations Received',
            value: '₱0',
            rawValue: 0,
            icon: <FaMoneyBillWave className="w-8 h-8 text-red-900" />,
            bgColor: 'bg-white',
            borderColor: '',
            textColor: 'text-gray-900',
            headerColor: 'text-red-900'
          },
          {
            id: 2,
            title: 'Donors Engaged',
            value: '0',
            rawValue: 0,
            icon: <FaUsers className="w-8 h-8 text-red-900" />,
            bgColor: 'bg-white',
            borderColor: '',
            textColor: 'text-gray-900',
            headerColor: 'text-red-900'
          },
          {
            id: 3,
            title: 'Beneficiaries Served',
            value: '0',
            rawValue: 0,
            icon: <FaHandsHelping className="w-8 h-8 text-red-900" />,
            bgColor: 'bg-white',
            borderColor: '',
            textColor: 'text-gray-900',
            headerColor: 'text-red-900'
          },
          {
            id: 4,
            title: 'Total Worth of Response',
            value: '₱0',
            rawValue: 0,
            icon: <FaGift className="w-8 h-8 text-red-900" />,
            bgColor: 'bg-white',
            borderColor: '',
            textColor: 'text-gray-900',
            headerColor: 'text-red-900'
          }
        ];
        setKpiData(fallbackKpiData);
      } finally {
        setLoading(false);
      }
    };

    fetchKPIData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="bg-gray-200 p-3 rounded-lg">
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">
                Unable to fetch real-time data. Showing fallback values. Error: {error}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {kpiData.map((kpi) => (
          <div
            key={kpi.id}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-900 text-sm font-semibold mb-2">{kpi.title}</p>
                <p className="text-gray-900 text-3xl font-bold" title={`Raw value: ${kpi.rawValue}`}>
                  {kpi.value}
                </p>
              </div>
              <div className={`${kpi.bgColor} p-3 rounded-lg`}>
                {kpi.icon}  
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaffKPICards;