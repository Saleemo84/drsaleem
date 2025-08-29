import React from 'react';
import { Appointment } from '../types';
import { CameraIcon, PaperclipIcon } from './icons';
import { translations } from '../i18n';

interface AppointmentsViewProps {
  appointments: Appointment[];
  onSelectAppointment: (appointment: Appointment) => void;
  t: (key: keyof typeof translations.en) => string;
}

const AppointmentsView: React.FC<AppointmentsViewProps> = ({ appointments, onSelectAppointment, t }) => {
  const days = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;
  const timeSlots = [];
  for (let i = 14; i < 22; i++) {
    timeSlots.push(`${i}:00`);
    timeSlots.push(`${i}:30`);
  }
  
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - (today.getDay() + 1) % 7); // Set start of the week to the most recent Saturday

  const currentDayIndex = (today.getDay() + 1) % 7; // Saturday is 0 for our week

  const dayColors = [
    'bg-rose-50',    // Sunday
    'bg-sky-50',     // Monday
    'bg-teal-50',    // Tuesday
    'bg-amber-50',   // Wednesday
    'bg-violet-50',  // Thursday
    'bg-slate-50',   // Friday
    'bg-fuchsia-50', // Saturday
  ];
  
  const getDayDate = (dayIndex: number) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + dayIndex);
    return date;
  };
  
  const getAppointmentsForSlot = (dayIndex: number, time: string) => {
    const dayDate = getDayDate(dayIndex);
    const [hour, minute] = time.split(':').map(Number);
    return appointments.filter(apt => {
        const aptDate = new Date(apt.dateTime);
        const aptHour = aptDate.getHours();
        const aptMinute = aptDate.getMinutes();
        const isSameDate = aptDate.toDateString() === dayDate.toDateString();
        
        return isSameDate && aptHour === hour && (minute < 30 ? aptMinute === 0 : aptMinute === 30);
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 overflow-x-auto">
      <div className="grid grid-cols-8" style={{minWidth: '1350px'}}>
        <div className="p-2 font-bold text-center text-slate-500">{t('time')}</div>
        {days.map((day, dayIndex) => (
          <div key={day} className={`p-2 font-bold text-center ${dayIndex === currentDayIndex ? 'text-primary' : 'text-slate-700'}`}>{t(day)}</div>
        ))}
      </div>
      <div className="grid grid-cols-8" style={{minWidth: '1350px'}}>
        {/* Time Column */}
        <div className="col-span-1">
          {timeSlots.map(time => (
            <div key={time} className="h-24 flex items-center justify-center border-t border-e border-slate-200 text-sm font-mono text-slate-500">{time}</div>
          ))}
        </div>
        {/* Day Columns */}
        {days.map((day, dayIndex) => (
          <div key={day} className={`col-span-1 ${dayIndex === currentDayIndex ? dayColors[(dayIndex+6)%7] : ''} ${day === 'friday' ? 'bg-slate-100' : ''}`}>
            {timeSlots.map(time => (
              <div key={time} className="h-24 border-t border-e border-slate-200 p-1">
                {day === 'friday' ? 
                  (time === '17:00' && <div className="text-center text-slate-400 font-semibold text-lg">{t('weekend')}</div>)
                  :
                  getAppointmentsForSlot(dayIndex, time).map(apt => (
                    <div 
                      key={apt.id} 
                      onClick={() => onSelectAppointment(apt)}
                      className="bg-primary text-white p-2 rounded-lg text-xs cursor-pointer h-full flex flex-col justify-center hover:bg-sky-600"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 overflow-hidden">
                          <p className="font-bold truncate">{apt.patientName}</p>
                          <p className="text-xs truncate text-sky-200">{apt.chiefComplaint}</p>
                        </div>
                        <div className="flex items-center space-x-1 flex-shrink-0 ms-1">
                          {apt.attachments && apt.attachments.length > 0 && <PaperclipIcon className="h-3 w-3 text-white" />}
                          {apt.xrayImageUrl && <CameraIcon className="h-3 w-3 text-white" />}
                        </div>
                      </div>
                      <p className="truncate mt-1">{apt.workDone}</p>
                      {apt.selectedTeeth && apt.selectedTeeth.length > 0 &&
                          <p className="text-xs truncate text-sky-200">{t('teeth')}: {apt.selectedTeeth.join(', ')}</p>
                      }
                    </div>
                  ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppointmentsView;
