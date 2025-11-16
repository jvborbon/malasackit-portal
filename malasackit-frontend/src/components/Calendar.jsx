import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { 
    HiCalendar, 
    HiClock, 
    HiLocationMarker, 
    HiUserGroup,
    HiPlus,
    HiDotsVertical,
    HiRefresh,
    HiUser,
    HiTruck,
    HiX
} from 'react-icons/hi';
import { formatDate, formatTime } from './utilities/donationHelpers';
import { getCalendarAppointments } from '../services/donationService';

export default function CalendarComponent() {
    const [date, setDate] = useState(new Date());
    const [view, setView] = useState('month');
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load calendar appointments when component mounts or date changes
    useEffect(() => {
        loadCalendarAppointments();
    }, [date]);

    const loadCalendarAppointments = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Get start and end of current month
            const year = date.getFullYear();
            const month = date.getMonth();
            const startDate = new Date(year, month, 1).toISOString().split('T')[0];
            const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
            
            const response = await getCalendarAppointments(startDate, endDate);
            
            if (response.success) {
                // Transform API response to calendar events
                const calendarEvents = response.data.events.map(event => ({
                    id: event.id,
                    title: event.title,
                    date: new Date(event.date),
                    time: formatTime(event.time),
                    location: event.location,
                    type: event.type,
                    participants: event.participants,
                    description: event.description,
                    donor: event.donor,
                    donation: event.donation
                }));
                
                setEvents(calendarEvents);
            }
        } catch (error) {
            console.error('Error loading calendar appointments:', error);
            setError('Failed to load appointments');
            setEvents([]); // Fallback to empty events
        } finally {
            setLoading(false);
        }
    };

    // Get events for selected date
    const getEventsForDate = (selectedDate) => {
        return events.filter(event => 
            event.date.toDateString() === selectedDate.toDateString()
        );
    };

    // Get events for current month
    const getEventsForMonth = (selectedDate) => {
        return events.filter(event => 
            event.date.getMonth() === selectedDate.getMonth() &&
            event.date.getFullYear() === selectedDate.getFullYear()
        );
    };

    // Mark dates with events
    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const dayEvents = getEventsForDate(date);
            if (dayEvents.length > 0) {
                return (
                    <div className="flex justify-center">
                        <div className="w-2 h-2 bg-red-600 rounded-full mt-1"></div>
                    </div>
                );
            }
        }
        return null;
    };

    // Style tiles with events
    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            const dayEvents = getEventsForDate(date);
            if (dayEvents.length > 0) {
                return 'has-events';
            }
        }
        return null;
    };

    const getEventTypeColor = (type) => {
        const colors = {
            pickup: 'bg-green-100 text-green-800 border-green-200',
            dropoff: 'bg-blue-100 text-blue-800 border-blue-200',
            'drop-off': 'bg-blue-100 text-blue-800 border-blue-200',
            event: 'bg-purple-100 text-purple-800 border-purple-200',
            registration: 'bg-orange-100 text-orange-800 border-orange-200',
            training: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
        return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getEventTypeIcon = (type) => {
        switch (type) {
            case 'pickup':
                return <HiLocationMarker className="w-4 h-4" />;
            case 'dropoff':
            case 'drop-off':
                return <HiUserGroup className="w-4 h-4" />;
            case 'event':
                return <HiUserGroup className="w-4 h-4" />;
            case 'registration':
                return <HiCalendar className="w-4 h-4" />;
            case 'training':
                return <HiClock className="w-4 h-4" />;
            default:
                return <HiCalendar className="w-4 h-4" />;
        }
    };

    const selectedDateEvents = getEventsForDate(date);
    const monthEvents = getEventsForMonth(date);

    return (
        <div className="space-y-4 h-full flex flex-col overflow-hidden">
            {/* Calendar Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Calendar</h2>
                    <p className="text-gray-600">Donation appointments and events</p>
                </div>
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={loadCalendarAppointments}
                        disabled={loading}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        title="Refresh appointments"
                    >
                        <HiRefresh className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button className="flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700">
                        <HiPlus className="w-4 h-4 mr-2" />
                        Add Event
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <HiX className="w-5 h-5 text-red-600 mr-2" />
                        <span className="text-red-800">{error}</span>
                        <button 
                            onClick={() => setError(null)}
                            className="ml-auto text-red-600 hover:text-red-800"
                        >
                            <HiX className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0 overflow-hidden">
                {/* Calendar */}
                <div className="lg:col-span-2 min-h-0">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full">
                        <div className="calendar-container">
                            <Calendar
                                onChange={setDate}
                                value={date}
                                view={view}
                                onViewChange={setView}
                                tileContent={tileContent}
                                tileClassName={tileClassName}
                                className="react-calendar-custom"
                                locale="en-US"
                                calendarType="gregory"
                                showNeighboringMonth={true}
                                next2Label={null}
                                prev2Label={null}
                                minDetail="month"
                                formatShortWeekday={(locale, date) => {
                                    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
                                    return days[date.getDay()];
                                }}
                                showFixedNumberOfWeeks={true}
                            />
                        </div>
                    </div>
                </div>

                {/* Events Sidebar */}
                <div className="space-y-4 flex flex-col h-full min-h-0">
                    {/* Selected Date Events */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex-shrink-0">
                            {formatDate(date, 'long')}
                        </h3>
                        
                        {selectedDateEvents.length > 0 ? (
                            <div className="space-y-3 overflow-y-auto max-h-64 pr-2 scrollbar-thin">
                                {selectedDateEvents.map((event) => (
                                    <div 
                                        key={event.id}
                                        className={`p-4 rounded-lg border ${getEventTypeColor(event.type)}`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center space-x-2">
                                                {getEventTypeIcon(event.type)}
                                                <h4 className="font-medium">{event.title}</h4>
                                            </div>
                                            {event.status && (
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    event.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {event.status}
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-2 space-y-1">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <HiClock className="w-4 h-4 mr-1" />
                                                {event.time}
                                            </div>
                                            {event.donor && (
                                                <div className="space-y-1">
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <HiUser className="w-4 h-4 mr-1" />
                                                        Donor: {event.donor.name}
                                                    </div>
                                                    {event.donor.phone && (
                                                        <div className="flex items-center text-sm text-gray-500 ml-5">
                                                            📞 {event.donor.phone}
                                                        </div>
                                                    )}
                                                    {event.donor.email && (
                                                        <div className="flex items-center text-sm text-gray-500 ml-5">
                                                            ✉️ {event.donor.email}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {event.deliveryMethod && (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <HiTruck className="w-4 h-4 mr-1" />
                                                    {event.deliveryMethod === 'pickup' ? 'Pickup' : 'Drop-off'}
                                                </div>
                                            )}
                                            {event.location && (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <HiLocationMarker className="w-4 h-4 mr-1" />
                                                    {event.location}
                                                </div>
                                            )}
                                        </div>
                                        {event.description && (
                                            <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                                {event.description}
                                            </p>
                                        )}
                                        {event.donation && (
                                            <div className="mt-2 text-xs text-gray-500 bg-blue-50 p-2 rounded">
                                                <div className="flex justify-between items-center">
                                                    <span>Donation ID: #{event.donation.id}</span>
                                                    {event.donation.totalValue && (
                                                        <span className="font-medium">₱{parseFloat(event.donation.totalValue).toLocaleString()}</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 flex-shrink-0">
                                <HiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No events scheduled for this date</p>
                                <button className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium">
                                    Add an event
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Monthly Overview */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            This Month ({monthEvents.length} events)
                        </h3>
                        
                        {monthEvents.length > 0 ? (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {monthEvents
                                    .sort((a, b) => a.date - b.date)
                                    .map((event) => (
                                    <div 
                                        key={event.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                                        onClick={() => setDate(event.date)}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-1 rounded ${getEventTypeColor(event.type)}`}>
                                                {getEventTypeIcon(event.type)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm text-gray-900">
                                                    {event.title}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {event.date.toLocaleDateString()} • {event.time}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">No events this month</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
