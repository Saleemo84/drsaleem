import React from 'react';
import Modal from './Modal';
import { CloudUploadIcon } from './icons';
import { translations } from '../i18n';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: (key: keyof typeof translations.en) => string;
}

const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose, t }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('backupSuccessTitle')} t={t}>
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <CloudUploadIcon className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-lg leading-6 font-medium text-slate-900 mt-4">{t('yourDataIsSafe')}</h3>
        <div className="mt-2 px-7 py-3">
          <p className="text-sm text-slate-500">
            {t('backupSuccessBody1')}{' '}
            <strong>dentaldash_backup_YYYY-MM-DD.json</strong>{' '}
            {t('backupSuccessBody2')}
          </p>
          <p className="text-sm text-slate-500 mt-2">
            {t('backupSuccessBody3')}
          </p>
        </div>
        <div className="items-center px-4 py-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {t('gotIt')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default BackupModal;
