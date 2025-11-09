import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { 
    HiCalendar, 
    HiClock, 
    HiLocationMarker, 
    HiUserGroup,
    HiPlus,
    HiDotsVertical
} from 'react-icons/hi';
import { formatDate } from './utilities/donationHelpers';

export default function CalendarComponent() {
    const [date, setDate] = useState(new Date());
    const [view, setView] = useState('month');
    const [events, setEvents] = useState([
        {
            id: 1,
            title: 'Food Donation Pickup',
            date: new Date(2025, 0, 25), // January 25, 2025
            time: '10:00 AM',
            location: 'LASAC Main Office',
            type: 'pickup',
            participants: 5,
            description: 'Regular monthly food donation pickup from major donors'
        },
        {
            id: 2,
            title: 'Clothing Drive Event',
            date: new Date(2025, 1, 5), // February 5, 2025
            time: '2:00 PM',
            location: 'Community Center',
            type: 'event',
            participants: 15,
            description: 'Community clothing donation drive and distribution'
        },
        {
            id: 3,
            title: 'Beneficiary Registration',
            date: new Date(2025, 0, 15), // January 15, 2025
            time: '9:00 AM',
            location: 'Parish Office',
            type: 'registration',
            participants: 8,
            description: 'New beneficiary registration and documentation'
        },
        {
            id: 4,
            title: 'Volunteer Training',
            date: new Date(2025, 0, 30), // January 30, 2025
            time: '1:00 PM',
            location: 'Training Room',
            type: 'training',
            participants: 12,
            description: 'Monthly volunteer orientation and training session'
        }
    ]);

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
            event: 'bg-blue-100 text-blue-800 border-blue-200',
            registration: 'bg-purple-100 text-purple-800 border-purple-200',
            training: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
        return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getEventTypeIcon = (type) => {
        switch (type) {
            case 'pickup':
                return <HiLocationMarker className="w-4 h-4" />;
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
        <div className="space-y-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Calendar</h2>
                <div className="flex items-center space-x-2">
                    <button className="flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700">
                        <HiPlus className="w-4 h-4 mr-2" />
                        Add Event
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                        <HiDotsVertical className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
                <div className="space-y-6">
                    {/* Selected Date Events */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {formatDate(date, 'long')}
                        </h3>
                        
                        {selectedDateEvents.length > 0 ? (
                            <div className="space-y-3">
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
                                        </div>
                                        <div className="mt-2 space-y-1">
                                            <div className="flex items-center text-sm">
                                                <HiClock className="w-4 h-4 mr-1" />
                                                {event.time}
                                            </div>
                                            <div className="flex items-center text-sm">
                                                <HiLocationMarker className="w-4 h-4 mr-1" />
                                                {event.location}
                                            </div>
                                            <div className="flex items-center text-sm">
                                                <HiUserGroup className="w-4 h-4 mr-1" />
                                                {event.participants} participants
                                            </div>
                                        </div>
                                        {event.description && (
                                            <p className="mt-2 text-sm opacity-75">
                                                {event.description}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
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
