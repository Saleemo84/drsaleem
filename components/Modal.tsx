import React, { ReactNode } from 'react';
import { CloseIcon } from './icons';
import { translations } from '../i18n';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  t: (key: keyof typeof translations.en) => string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, t }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl transform transition-all sm:my-8 sm:max-w-3xl sm:w-full max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-4 border-b rounded-t sticky top-0 bg-white z-10">
          <h3 className="text-xl font-semibold text-slate-900" id="modal-title">
            {title}
          </h3>
          <button
            type="button"
            className="text-slate-400 bg-transparent hover:bg-slate-200 hover:text-slate-900 rounded-lg text-sm p-1.5 ms-auto inline-flex items-center"
            onClick={onClose}
          >
            <CloseIcon className="w-5 h-5" />
            <span className="sr-only">{t('close')} modal</span>
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
