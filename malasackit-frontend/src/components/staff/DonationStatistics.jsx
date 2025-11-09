import React from 'react';
import { HiUser, HiClock, HiCheck, HiCalendar } from 'react-icons/hi';
import StatCard from './StatCard';

function DonationStatistics({ donations, pagination, formatCurrency }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard 
        title="Total Requests" 
        value={pagination.total} 
        icon={HiUser} 
        color="bg-blue-500" 
      />
      <StatCard 
        title="Pending" 
        value={donations.filter(d => d.status === 'Pending').length} 
        icon={HiClock} 
        color="bg-yellow-500" 
      />
      <StatCard 
        title="Approved" 
        value={donations.filter(d => d.status === 'Approved').length} 
        icon={HiCheck} 
        color="bg-green-500" 
      />
      <StatCard 
        title="Total Value" 
        value={formatCurrency(donations.reduce((sum, d) => sum + parseFloat(d.total_value || 0), 0))} 
        icon={HiCalendar} 
        color="bg-purple-500" 
      />
    </div>
  );
}

export default DonationStatistics;