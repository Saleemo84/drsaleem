import React, { useMemo } from 'react';
import { Appointment, Expense } from '../types';
import { translations } from '../i18n';
import { CheckCircleIcon } from './icons';

interface FinancesViewProps {
  appointments: Appointment[];
  expenses: Expense[];
  t: (key: keyof typeof translations.en) => string;
}

const FinancesView: React.FC<FinancesViewProps> = ({ appointments, expenses, t }) => {
  const totalIncome = useMemo(() => appointments.reduce((sum, apt) => sum + apt.paymentDone, 0), [appointments]);
  const totalExpenses = useMemo(() => expenses.reduce((sum, exp) => sum + exp.amount, 0), [expenses]);
  const netProfit = totalIncome - totalExpenses;

  const TableRow: React.FC<{ children: React.ReactNode; isHeader?: boolean; cols?: number }> = ({ children, isHeader = false, cols = 6 }) => (
    <div className={`grid grid-cols-${cols} gap-4 items-center px-4 py-3 ${isHeader ? 'font-bold bg-slate-100 rounded-t-lg' : 'border-b border-slate-100'}`}>
      {children}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-100 p-6 rounded-xl text-green-800">
          <p className="text-lg font-semibold">{t('totalIncome')}</p>
          <p className="text-4xl font-bold">${totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-red-100 p-6 rounded-xl text-red-800">
          <p className="text-lg font-semibold">{t('totalExpenditures')}</p>
          <p className="text-4xl font-bold">${totalExpenses.toLocaleString()}</p>
        </div>
        <div className={`p-6 rounded-xl ${netProfit >= 0 ? 'bg-sky-100 text-sky-800' : 'bg-orange-100 text-orange-800'}`}>
          <p className="text-lg font-semibold">{t('netProfit')}</p>
          <p className="text-4xl font-bold">${netProfit.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md">
          <h3 className="text-xl font-bold p-4 border-b">{t('incomeRecords')}</h3>
          <div className="max-h-[60vh] overflow-y-auto">
            <TableRow isHeader cols={6}>
              <div className="col-span-1">{t('date')}</div>
              <div className="col-span-1">{t('patient')}</div>
              <div className="text-end">{t('amountPaid')}</div>
              <div className="text-end">{t('amountDue')}</div>
              <div className="col-span-1">{t('workDone')}</div>
              <div className="text-center">{t('status')}</div>
            </TableRow>
            {appointments.sort((a,b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()).map(apt => (
              <TableRow key={apt.id} cols={6}>
                <div className="col-span-1">{new Date(apt.dateTime).toLocaleDateString()}</div>
                <div className="truncate col-span-1">{apt.patientName}</div>
                <div className="text-end text-green-600 font-medium">${apt.paymentDone.toLocaleString()}</div>
                <div className="text-end text-red-600 font-medium">${apt.paymentDue.toLocaleString()}</div>
                <div className="truncate col-span-1">{apt.workDone}</div>
                <div className="flex justify-center">
                    {apt.isPaid ? 
                        <CheckCircleIcon className="h-5 w-5 text-green-500" /> : 
                        <div className="h-5 w-5 rounded-full bg-red-200 border border-red-400" title="Unpaid" />
                    }
                </div>
              </TableRow>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md">
          <h3 className="text-xl font-bold p-4 border-b">{t('expenditureRecords')}</h3>
          <div className="max-h-[60vh] overflow-y-auto">
             <TableRow isHeader cols={5}>
                <div className="col-span-2">{t('description')}</div>
                <div>{t('category')}</div>
                <div>{t('date')}</div>
                <div className="text-end">{t('amount')}</div>
            </TableRow>
            {expenses.map(exp => (
              <TableRow key={exp.id} cols={5}>
                <div className="col-span-2 truncate">{exp.description}</div>
                <div>{exp.category}</div>
                <div>{new Date(exp.date).toLocaleDateString()}</div>
                <div className="text-end text-red-600 font-medium">${exp.amount.toLocaleString()}</div>
              </TableRow>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancesView;
