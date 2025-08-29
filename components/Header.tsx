import React from 'react';
import { SyncIcon, SpinnerIcon, CloudUploadIcon } from './icons';
import NotificationBell from './NotificationBell';
import { translations } from '../i18n';

interface HeaderProps {
  title: string;
  isSyncing: boolean;
  onSync: () => void;
  onBackup: () => void;
  notifications: string[];
  t: (key: keyof typeof translations.en) => string;
  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;
}

const Header: React.FC<HeaderProps> = ({ title, isSyncing, onSync, onBackup, notifications, t, language, setLanguage }) => {
    
  const handleSync = () => {
    if (isSyncing) return;
    alert("This is a demo feature. In a real application, this would trigger an OAuth authentication flow with Microsoft Outlook. We will now simulate fetching calendar events.");
    onSync();
  };

  return (
    <header className="flex items-center justify-between h-20 px-6 bg-white border-b border-slate-200 flex-shrink-0">
      <h2 className="text-3xl font-bold text-slate-800">{title}</h2>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1 bg-slate-200 rounded-full p-1">
            <button onClick={() => setLanguage('en')} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${language === 'en' ? 'bg-white text-primary shadow' : 'text-slate-600 hover:bg-slate-300'}`}>EN</button>
            <button onClick={() => setLanguage('ar')} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${language === 'ar' ? 'bg-white text-primary shadow' : 'text-slate-600 hover:bg-slate-300'}`}>AR</button>
        </div>
        <button 
          onClick={onBackup}
          className="flex items-center justify-center px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
        >
          <CloudUploadIcon className="h-5 w-5 me-2" />
          <span>{t('backupData')}</span>
        </button>
        <button 
          onClick={handleSync}
          disabled={isSyncing}
          className="flex items-center justify-center px-4 py-2 w-48 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-wait"
        >
          {isSyncing ? (
            <>
              <SpinnerIcon className="h-5 w-5 me-2 animate-spin" />
              <span>{t('syncing')}</span>
            </>
          ) : (
            <>
              <SyncIcon className="h-5 w-5 me-2" />
              <span>{t('syncWithOutlook')}</span>
            </>
          )}
        </button>
        <NotificationBell notifications={notifications} t={t} />
      </div>
    </header>
  );
};

export default Header;
