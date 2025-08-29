import React from 'react';
import { Appointment, Expense, LabWork, LabWorkStatus } from '../types';
import { MoneyIcon, UsersIcon, BeakerIcon, CameraIcon, CalendarDaysIcon, PaperclipIcon } from './icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import BackupReminder from './BackupReminder';
import { translations } from '../i18n';

interface DashboardProps {
  appointments: Appointment[];
  expenses: Expense[];
  labWorks: LabWork[];
  onSelectAppointment: (appointment: Appointment) => void;
  onBackup: () => void;
  t: (key: keyof typeof translations.en) => string;
}

const Dashboard: React.FC<DashboardProps> = ({ appointments, expenses, labWorks, onSelectAppointment, onBackup, t }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysAppointments = appointments.filter(
    (apt) => new Date(apt.dateTime).toDateString() === new Date().toDateString()
  ).sort((a,b) => a.dateTime.getTime() - b.dateTime.getTime());

  const todaysIncome = todaysAppointments.reduce((sum, apt) => sum + apt.paymentDone, 0);
  
  const upcomingLabWorkCount = labWorks.filter(lw => lw.status === LabWorkStatus.Sent).length;
  
  // Patient statistics
  const getUniquePatientCount = (apps: Appointment[]) => new Set(apps.map(a => a.patientName)).size;
  
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const weeklyAppointments = appointments.filter(a => new Date(a.dateTime) >= startOfWeek);
  const weeklyPatientCount = getUniquePatientCount(weeklyAppointments);
  
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthlyAppointments = appointments.filter(a => new Date(a.dateTime) >= startOfMonth);
  const monthlyPatientCount = getUniquePatientCount(monthlyAppointments);

  // Dynamic weekly financial chart data
  const generateWeeklyFinancialData = () => {
    const data = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for(let i=6; i>=0; i--){
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dayKey = date.toISOString().split('T')[0];
        
        const dailyIncome = appointments
            .filter(a => new Date(a.dateTime).toISOString().split('T')[0] === dayKey)
            .reduce((sum, a) => sum + a.paymentDone, 0);
            
        const dailyExpenses = expenses
            .filter(e => new Date(e.date).toISOString().split('T')[0] === dayKey)
            .reduce((sum, e) => sum + e.amount, 0);

        data.push({
            name: days[date.getDay()],
            income: dailyIncome,
            expenses: dailyExpenses
        });
    }
    return data;
  };

  const weeklyChartData = generateWeeklyFinancialData();

  const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; color: string }> = ({ icon, title, value, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-md flex items-center">
      <div className={`p-3 rounded-full ${color}`}>
        {icon}
      </div>
      <div className="ms-4">
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard icon={<MoneyIcon className="h-6 w-6 text-green-800" />} title={t('todaysIncome')} value={`$${todaysIncome.toLocaleString()}`} color="bg-green-100" />
        <StatCard icon={<UsersIcon className="h-6 w-6 text-sky-800" />} title={t('todaysAppointments')} value={todaysAppointments.length.toString()} color="bg-sky-100" />
        <StatCard icon={<UsersIcon className="h-6 w-6 text-indigo-800" />} title={t('thisWeeksPatients')} value={weeklyPatientCount.toString()} color="bg-indigo-100" />
        <StatCard icon={<CalendarDaysIcon className="h-6 w-6 text-amber-800" />} title={t('thisMonthsPatients')} value={monthlyPatientCount.toString()} color="bg-amber-100" />
        <StatCard icon={<BeakerIcon className="h-6 w-6 text-purple-800" />} title={t('upcomingLabWork')} value={upcomingLabWorkCount.toString()} color="bg-purple-100" />
      </div>

      <div className="lg:col-span-2">
        <BackupReminder onBackup={onBackup} t={t} />
      </div>
      

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-bold mb-4">{t('last7DaysFinancials')}</h3>
           <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart data={weeklyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="income" name={t('income')} fill="#38bdf8" />
                <Bar dataKey="expenses" name={t('expenses')} fill="#f472b6" />
                </BarChart>
            </ResponsiveContainer>
           </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-bold mb-4">{t('todaysAppointments')}</h3>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {todaysAppointments.length > 0 ? todaysAppointments.map(apt => (
              <div key={apt.id} onClick={() => onSelectAppointment(apt)} className="p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{apt.patientName}</p>
                    <p className="text-xs text-slate-500">{apt.chiefComplaint}</p>
                  </div>
                  <p className="text-sm font-mono bg-sky-100 text-sky-700 px-2 py-1 rounded">{new Date(apt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                 <div className="flex justify-between items-center text-sm text-slate-600 mt-1">
                    <p className="truncate">{apt.workDone}</p>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                        {apt.attachments && apt.attachments.length > 0 && <span title={`${apt.attachments.length} attachments`}><PaperclipIcon className="h-4 w-4 text-slate-500" /></span>}
                        {apt.xrayImageUrl && <CameraIcon className="h-4 w-4 text-slate-500" />}
                    </div>
                </div>
              </div>
            )) : <p className="text-slate-500 text-center pt-8">{t('noAppointmentsToday')}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
