import React from 'react';
import { LabWork, LabWorkStatus } from '../types';
import { translations } from '../i18n';

interface LabWorkViewProps {
  labWorks: LabWork[];
  t: (key: keyof typeof translations.en) => string;
}

const LabWorkView: React.FC<LabWorkViewProps> = ({ labWorks, t }) => {
  const getStatusChip = (status: LabWorkStatus) => {
    switch (status) {
      case LabWorkStatus.Sent:
        return <span className="px-3 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">{status}</span>;
      case LabWorkStatus.Received:
        return <span className="px-3 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">{status}</span>;
      case LabWorkStatus.Completed:
        return <span className="px-3 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">{status}</span>;
      default:
        return null;
    }
  };

  const TableRow: React.FC<{ children: React.ReactNode; isHeader?: boolean }> = ({ children, isHeader = false }) => (
    <div className={`grid grid-cols-12 gap-4 items-center px-4 py-3 ${isHeader ? 'font-bold bg-slate-100 rounded-t-lg' : 'border-b border-slate-100'}`}>
      {children}
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-md">
      <h3 className="text-xl font-bold p-4 border-b">{t('labWorkTracking')}</h3>
      <div className="max-h-[80vh] overflow-y-auto">
        <TableRow isHeader>
          <div className="col-span-2">{t('patient')}</div>
          <div className="col-span-2">{t('lab')}</div>
          <div className="col-span-3">{t('typeOfWork')}</div>
          <div>{t('sent')}</div>
          <div>{t('due')}</div>
          <div className="text-end">{t('cost')}</div>
          <div className="col-span-2 text-center">{t('status')}</div>
        </TableRow>
        {labWorks.sort((a,b) => b.dateSent.getTime() - a.dateSent.getTime()).map(lw => (
          <TableRow key={lw.id}>
            <div className="col-span-2 font-medium truncate">{lw.patientName}</div>
            <div className="col-span-2 text-slate-600 truncate">{lw.labName}</div>
            <div className="col-span-3 text-slate-600 truncate">{lw.typeOfWork}</div>
            <div className="text-slate-600">{new Date(lw.dateSent).toLocaleDateString()}</div>
            <div className="text-slate-600">{new Date(lw.dateDue).toLocaleDateString()}</div>
            <div className="text-end text-slate-600 font-mono">${lw.cost.toLocaleString()}</div>
            <div className="col-span-2 flex justify-center">{getStatusChip(lw.status)}</div>
          </TableRow>
        ))}
      </div>
    </div>
  );
};

export default LabWorkView;
