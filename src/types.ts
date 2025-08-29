export enum View {
  Dashboard = 'Dashboard',
  Appointments = 'Appointments',
  Finances = 'Finances',
  LabWork = 'Lab Work',
}

export interface AttachedFile {
  id: string;
  name: string;
  type: string;
  data: string; // Data URL
}

export interface Appointment {
  id:string;
  patientName: string;
  phoneNumber: string;
  dateTime: Date;
  chiefComplaint: string;
  workDone: string;
  paymentDone: number;
  paymentDue: number;
  isPaid: boolean;
  notes: string;
  xrayImageUrl?: string;
  selectedTeeth?: number[];
  attachments?: AttachedFile[];
}

export enum ExpenseCategory {
  Lab = 'Lab Payment',
  Supplies = 'Dental Supplies',
  Bill = 'Utility Bill',
  Other = 'Other',
}

export interface Expense {
  id: string;
  date: Date;
  category: ExpenseCategory;
  description: string;
  amount: number;
}

export enum LabWorkStatus {
  Sent = 'Sent to Lab',
  Received = 'Received from Lab',
  Completed = 'Completed',
}

export interface LabWork {
  id: string;
  patientName: string;
  labName: string;
  typeOfWork: string;
  dateSent: Date;
  dateDue: Date;
  status: LabWorkStatus;
  cost: number;
}
