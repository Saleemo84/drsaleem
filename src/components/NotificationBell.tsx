import React, { useState, useRef, useEffect } from 'react';
import { BellIcon } from './icons';
import { translations } from '../i18n';

interface NotificationBellProps {
    notifications: string[];
    t: (key: keyof typeof translations.en) => string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ notifications, t }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasNotifications = notifications.length > 0;
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [ref]);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setIsOpen(prev => hasNotifications ? !prev : false)}
                className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                aria-label="View notifications"
            >
                <BellIcon className="h-6 w-6" />
                {hasNotifications && (
                    <span className="absolute top-1 end-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                )}
            </button>
            {isOpen && hasNotifications && (
                <div className="absolute end-0 mt-2 w-80 bg-white rounded-md shadow-lg z-20 border border-slate-200">
                    <div className="p-3 border-b border-slate-200">
                        <h4 className="text-md font-semibold text-slate-800">{t('yearEndReminders')}</h4>
                    </div>
                    <ul className="py-2 max-h-64 overflow-y-auto">
                        {notifications.map((note, index) => (
                            <li key={index} className="px-4 py-2 text-sm text-slate-700 border-b border-slate-100 last:border-b-0">
                                {note}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
