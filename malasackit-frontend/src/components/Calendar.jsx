export default function Calendar() {
    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Donation Calendar</h2>
            <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="p-2 text-center font-semibold text-gray-600 bg-gray-50 rounded">
                        {day}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }, (_, i) => {
                    const day = i - 5; // Start from -5 to show previous month days
                    const isCurrentMonth = day > 0 && day <= 31;
                    const hasEvent = [5, 12, 18, 25].includes(day);
                    
                    return (
                        <div 
                            key={i} 
                            className={`p-2 text-center rounded ${
                                isCurrentMonth 
                                    ? 'text-gray-900 hover:bg-gray-100' 
                                    : 'text-gray-400'
                            } ${hasEvent ? 'bg-red-100 text-red-800 font-semibold' : ''}`}
                        >
                            {day > 0 ? day : ''}
                            {hasEvent && <div className="w-1 h-1 bg-red-600 rounded-full mx-auto mt-1"></div>}
                        </div>
                    );
                })}
            </div>
            <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-2">Upcoming Events</h3>
                <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded">
                        <span className="text-red-800">Food Donation Pickup</span>
                        <span className="text-sm text-red-600">Jan 25, 2025</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                        <span className="text-blue-800">Clothing Drive Event</span>
                        <span className="text-sm text-blue-600">Feb 5, 2025</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
