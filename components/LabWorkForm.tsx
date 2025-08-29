import React, { useState } from 'react';
import { LabWork, LabWorkStatus } from '../types';
import Modal from './Modal';
import { translations } from '../i18n';

interface LabWorkFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (labWork: Omit<LabWork, 'id'>) => void;
  t: (key: keyof typeof translations.en) => string;
}

const LabWorkForm: React.FC<LabWorkFormProps> = ({ isOpen, onClose, onSave, t }) => {
  const [formData, setFormData] = useState({
    patientName: '',
    labName: '',
    typeOfWork: '',
    dateSent: new Date(),
    dateDue: new Date(new Date().setDate(new Date().getDate() + 7)), // Default due date 7 days from now
    status: LabWorkStatus.Sent,
    cost: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: new Date(value) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.patientName && formData.labName && formData.typeOfWork && formData.cost >= 0) {
      onSave(formData);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('addLabWork')} t={t}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <InputField label={t('patientName')} name="patientName" value={formData.patientName} onChange={handleChange} required />
          <InputField label={t('labName')} name="labName" value={formData.labName} onChange={handleChange} required />
        </div>
        <InputField label={t('typeOfWork')} name="typeOfWork" value={formData.typeOfWork} onChange={handleChange} required />
        <div className="grid grid-cols-2 gap-4">
            <InputField label={t('sent')} name="dateSent" value="" onChange={() => {}}>
                <input type="date" name="dateSent" value={formData.dateSent.toISOString().split('T')[0]} onChange={handleDateChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
            </InputField>
            <InputField label={t('due')} name="dateDue" value="" onChange={() => {}}>
                <input type="date" name="dateDue" value={formData.dateDue.toISOString().split('T')[0]} onChange={handleDateChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
            </InputField>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <InputField label={t('status')} name="status" value={formData.status} onChange={handleChange}>
                <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                    {Object.values(LabWorkStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </InputField>
            <InputField label={`${t('cost')} ($)`} name="cost" type="number" value={formData.cost} onChange={handleChange} required />
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">{t('cancel')}</button>
          <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-sky-600">{t('saveLabWork')}</button>
        </div>
      </form>
    </Modal>
  );
};

const InputField: React.FC<{ label: string; name: string; type?: string; value: string | number; onChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement>; required?: boolean; children?: React.ReactNode}> = ({label, name, type="text", value, onChange, required=false, children}) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700">{label}</label>
      {children ? children :
      <input type={type} id={name} name={name} value={value} onChange={onChange} required={required} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
      }
    </div>
);


export default LabWorkForm;
