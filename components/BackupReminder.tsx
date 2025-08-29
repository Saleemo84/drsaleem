import React, { useState, useEffect } from 'react';
import { CloudUploadIcon, CloseIcon } from './icons';
import { translations } from '../i18n';

interface BackupReminderProps {
    onBackup: () => void;
    t: (key: keyof typeof translations.en) => string;
}

const BackupReminder: React.FC<BackupReminderProps> = ({ onBackup, t }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const lastBackupDateStr = localStorage.getItem('lastBackupDate');
        if (lastBackupDateStr) {
            const lastBackupDate = new Date(lastBackupDateStr);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            if (lastBackupDate < sevenDaysAgo) {
                setIsVisible(true);
            }
        } else {
            // If no backup has ever been made, show the reminder
            setIsVisible(true);
        }
    }, []);
    
    const handleBackup = () => {
        onBackup();
        setIsVisible(false); // Hide reminder after backup is initiated
    }

    if (!isVisible) {
        return null;
    }

    return (
        <div className="bg-yellow-100 border-s-4 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow-md flex items-center justify-between">
            <div>
                <p className="font-bold">{t('backupReminderTitle')}</p>
                <p className="text-sm">{t('backupReminderBody')}</p>
            </div>
            <div className="flex items-center">
                <button 
                    onClick={handleBackup}
                    className="flex items-center bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors"
                >
                    <CloudUploadIcon className="h-5 w-5 me-2" />
                    {t('backupNow')}
                </button>
                 <button onClick={() => setIsVisible(false)} className="ms-4 text-yellow-600 hover:text-yellow-800">
                    <CloseIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

export default BackupReminder;
