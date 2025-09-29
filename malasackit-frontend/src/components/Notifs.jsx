import { HiBell } from 'react-icons/hi';

export default function Notifs() {
    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                    <HiBell className="w-16 h-16 mx-auto" />
                </div>
                <p className="text-gray-500 text-lg">No new notifications.</p>
                <p className="text-gray-400 text-sm mt-2">You're all caught up!</p>
            </div>
        </div>
    );
}
