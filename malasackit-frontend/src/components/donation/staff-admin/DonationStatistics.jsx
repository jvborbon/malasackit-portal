import React from 'react';
import { HiUser, HiClock, HiCheck, HiCalendar } from 'react-icons/hi';
import StatCard from './StatCard';

function DonationStatistics({ statistics, formatCurrency }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard 
        title="Completed" 
        value={statistics.completed} 
        icon={HiUser} 
        color="bg-blue-500" 
      />
      <StatCard 
        title="Pending" 
        value={statistics.pending} 
        icon={HiClock} 
        color="bg-yellow-500" 
      />
      <StatCard 
        title="Approved" 
        value={statistics.approved} 
        icon={HiCheck} 
        color="bg-green-500" 
      />
      <StatCard 
        title="Total Value" 
        value={formatCurrency(statistics.totalValue)} 
        icon={HiCalendar} 
        color="bg-purple-500" 
      />
    </div>
  );
}

export default DonationStatistics;