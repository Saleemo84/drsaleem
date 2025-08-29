import React, { useEffect } from 'react';
import { CheckCircleIcon, CloseIcon } from './icons';

interface ToastProps {
  message: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-dismiss after 5 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  return (
    <div 
      className="fixed bottom-8 end-8 z-[100] bg-white rounded-lg shadow-2xl p-4 flex items-center border-s-4 border-primary animate-fade-in-up w-full max-w-sm"
      role="alert"
      aria-live="assertive"
    >
      <CheckCircleIcon className="h-6 w-6 text-primary me-3 flex-shrink-0" />
      <p className="text-sm text-slate-700 flex-grow">{message}</p>
      <button onClick={onClose} className="ms-4 text-slate-400 hover:text-slate-600 flex-shrink-0">
        <CloseIcon className="h-5 w-5" />
        <span className="sr-only">Close notification</span>
      </button>
    </div>
  );
};

export default Toast;
