import React, { useState } from 'react';
import { Expense, ExpenseCategory } from '../types';
import Modal from './Modal';
import { translations } from '../i18n';

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id'>) => void;
  t: (key: keyof typeof translations.en) => string;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ isOpen, onClose, onSave, t }) => {
  const [formData, setFormData] = useState({
    date: new Date(),
    category: ExpenseCategory.Other,
    description: '',
    amount: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, date: new Date(e.target.value) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(formData.description && formData.amount > 0) {
        onSave(formData);
        onClose();
    }
  };

  const InputField: React.FC<{ label: string; name: string; type?: string; value: string | number; onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>; required?: boolean; children?: React.ReactNode}> = ({label, name, type="text", value, onChange, required=false, children}) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700">{label}</label>
      {children ? children :
      <input type={type} id={name} name={name} value={value} onChange={onChange} required={required} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
      }
    </div>
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('addExpense')} t={t}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField label={t('description')} name="description" value={formData.description} onChange={handleChange} required />
        
        <div className="grid grid-cols-2 gap-4">
            <InputField label={t('category')} name="category" value={formData.category} onChange={handleChange}>
                <select id="category" name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                    {Object.values(ExpenseCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </InputField>
            <InputField label={`${t('amount')} ($)`} name="amount" type="number" value={formData.amount} onChange={handleChange} required />
        </div>
        
        <InputField label={t('date')} name="date" value={formData.date.toISOString().split('T')[0]} onChange={handleDateChange}>
            <input type="date" id="date" name="date" value={formData.date.toISOString().split('T')[0]} onChange={handleDateChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
        </InputField>

        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">{t('cancel')}</button>
          <button type="submit" className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-teal-700">{t('saveExpense')}</button>
        </div>
      </form>
    </Modal>
  );
};

export default ExpenseForm;
