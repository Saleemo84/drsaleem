import React, { useState, useEffect } from 'react';
import { View } from '../types';
import { DashboardIcon, CalendarIcon, MoneyIcon, BeakerIcon, ToothIcon, SunIcon } from './icons';
import { translations } from '../i18n';

interface SidebarProps {
  activeView: View;
  setView: (view: View) => void;
  t: (key: keyof typeof translations.en) => string;
  language: 'en' | 'ar';
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setView, t, language }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    const locale = language === 'ar' ? 'ar-EG' : 'en-US';
    const formattedDate = currentTime.toLocaleDateString(locale, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });
    const formattedTime = currentTime.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
    });


  const navItems = [
    { view: View.Dashboard, icon: <DashboardIcon className="h-6 w-6" />, label: 'dashboard' },
    { view: View.Appointments, icon: <CalendarIcon className="h-6 w-6" />, label: 'appointments' },
    { view: View.Finances, icon: <MoneyIcon className="h-6 w-6" />, label: 'finances' },
    { view: View.LabWork, icon: <BeakerIcon className="h-6 w-6" />, label: 'labWork' },
  ] as const;

  return (
    <nav className="w-64 bg-dark text-white flex flex-col flex-shrink-0">
      <div className="flex items-center justify-center h-20 border-b border-sky-900">
        <ToothIcon className="h-10 w-10 text-primary" />
        <h1 className="text-2xl font-bold ms-2">DRSALEEM</h1>
      </div>
      
      <div className="p-4 space-y-2 border-b border-sky-900">
        <h2 className="text-lg font-semibold text-white">{t('clinicName')}</h2>
        <p className="text-sm text-slate-300">{t('dentistName')}</p>
        <p className="text-sm text-slate-300">07507816500</p>
        <div className="pt-2 text-sm text-slate-300">
            <p>{formattedDate}</p>
            <p>{formattedTime}</p>
            <div className="flex items-center mt-1">
                <SunIcon className="h-5 w-5 text-yellow-300 me-2" />
                <span>24°C Sunny</span>
            </div>
        </div>
      </div>

      <ul className="flex-1 px-4 py-6">
        {navItems.map((item) => (
          <li key={item.view}>
            <button
              onClick={() => setView(item.view)}
              className={`flex items-center w-full px-4 py-3 my-1 text-start rounded-lg transition-colors duration-200 ${
                activeView === item.view
                  ? 'bg-primary text-white'
                  : 'text-slate-300 hover:bg-sky-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="ms-4 font-medium">{t(item.label)}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="p-4 border-t border-sky-900">
        <p className="text-xs text-slate-400">{t('copyright')}</p>
      </div>
    </nav>
  );
};

export default Sidebar;
