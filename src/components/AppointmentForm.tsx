import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Appointment, AttachedFile } from '../types';
import Modal from './Modal';
import DentalChart from './DentalChart';
import { CameraIcon, PhoneIcon, WhatsAppIcon, ShareIcon, PaperclipIcon, TrashIcon, SparklesIcon, SpinnerIcon } from './icons';
import { translations } from '../i18n';

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: Partial<Appointment>) => void;
  appointment: Appointment | null;
  t: (key: keyof typeof translations.en) => string;
  setToastMessage: (message: string) => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ isOpen, onClose, onSave, appointment, t, setToastMessage }) => {
  const [formData, setFormData] = useState<Omit<Appointment, 'id'>>({
    patientName: '',
    phoneNumber: '',
    dateTime: new Date(),
    chiefComplaint: '',
    workDone: '',
    paymentDone: 0,
    paymentDue: 0,
    isPaid: false,
    notes: '',
    xrayImageUrl: undefined,
    selectedTeeth: [],
    attachments: [],
  });
  const [isSmartFilling, setIsSmartFilling] = useState(false);


  useEffect(() => {
    if (appointment) {
      setFormData({
          ...appointment,
          dateTime: new Date(appointment.dateTime), // Ensure it's a Date object
          selectedTeeth: appointment.selectedTeeth || [],
          xrayImageUrl: appointment.xrayImageUrl || undefined,
          attachments: appointment.attachments || [],
      });
    } else {
      const nextSlot = new Date();
      nextSlot.setMinutes(Math.ceil(nextSlot.getMinutes() / 30) * 30, 0, 0);
      setFormData({
        patientName: '',
        phoneNumber: '',
        dateTime: nextSlot,
        chiefComplaint: '',
        workDone: '',
        paymentDone: 0,
        paymentDue: 0,
        isPaid: false,
        notes: '',
        xrayImageUrl: undefined,
        selectedTeeth: [],
        attachments: [],
      });
    }
  }, [appointment, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    
    setFormData(prev => ({
      ...prev,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : (type === 'number' ? parseFloat(value) || 0 : value),
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDateTime = new Date(formData.dateTime);
    const [year, month, day] = e.target.value.split('-').map(Number);
    newDateTime.setFullYear(year, month - 1, day);
    setFormData(prev => ({ ...prev, dateTime: newDateTime }));
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDateTime = new Date(formData.dateTime);
    const [hours, minutes] = e.target.value.split(':').map(Number);
    newDateTime.setHours(hours, minutes);
    setFormData(prev => ({ ...prev, dateTime: newDateTime }));
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, xrayImageUrl: event.target?.result as string }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newAttachment: AttachedFile = {
            id: `${Date.now()}-${index}`,
            name: file.name,
            type: file.type,
            data: event.target?.result as string,
          };
          setFormData(prev => ({
            ...prev,
            attachments: [...(prev.attachments || []), newAttachment],
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };
  
  const handleRemoveAttachment = (id: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments?.filter(file => file.id !== id)
    }));
  };

  const handleShareContact = async () => {
    const clinicDetails = {
        title: 'DRSALEEM Clinic Contact',
        text: `Hello! Here are the contact details for DRSALEEM Clinic:\nPhone: 07507816500\nLooking forward to seeing you.`,
    };

    if (navigator.share) {
        try {
            await navigator.share(clinicDetails);
        } catch (error) {
            console.error('Error sharing contact details:', error);
            setToastMessage('Could not share contact details.');
        }
    } else {
        navigator.clipboard.writeText(clinicDetails.text)
            .then(() => setToastMessage('Contact details copied to clipboard!'))
            .catch(err => {
                console.error('Failed to copy text: ', err);
                setToastMessage('Could not copy contact details.');
            });
    }
  };

  const handleSmartFill = async () => {
    if (!process.env.API_KEY) {
        alert("Gemini API key is not configured. This is a demo feature.");
        return;
    }
    if (!formData.chiefComplaint) {
        setToastMessage('Please enter a chief complaint first.');
        return;
    }

    setIsSmartFilling(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const schema = {
            type: Type.OBJECT,
            properties: {
                workDone: { type: Type.STRING, description: "The dental procedure performed." },
                paymentDone: { type: Type.NUMBER, description: "The initial payment made by the patient." },
                paymentDue: { type: Type.NUMBER, description: "The remaining balance to be paid." },
                selectedTeeth: {
                    type: Type.ARRAY,
                    description: "An array of tooth numbers (1-32) relevant to the complaint.",
                    items: { type: Type.NUMBER }
                },
                notes: { type: Type.STRING, description: "Brief notes about the procedure." }
            },
            required: ["workDone", "paymentDone", "paymentDue"]
        };

        const prompt = `You are a helpful dental clinic assistant. Based on the patient's chief complaint, suggest the work done, payments, relevant tooth numbers, and notes. The complaint is: "${formData.chiefComplaint}". Respond ONLY with a valid JSON object matching the provided schema.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });

        const resultText = response.text.trim();
        const result = JSON.parse(resultText);

        setFormData(prev => ({
            ...prev,
            workDone: result.workDone || prev.workDone,
            paymentDone: result.paymentDone || 0,
            paymentDue: result.paymentDue || 0,
            isPaid: (result.paymentDue || 0) === 0,
            selectedTeeth: result.selectedTeeth || [],
            notes: result.notes || prev.notes
        }));

    } catch (error) {
        console.error("Error with Smart Fill:", error);
        setToastMessage(t('smartFillError'));
    } finally {
        setIsSmartFilling(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: appointment?.id });
    if (formData.phoneNumber) {
        setToastMessage(t('contactSyncedWithOutlook'));
    }
    onClose();
  };
  
  const InputField: React.FC<{ label: string; name: string; type?: string; value?: string | number; onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>; required?: boolean; children?: React.ReactNode}> = ({label, name, type="text", value, onChange, required=false, children}) => (
      <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700">{label}</label>
        {children ? children :
        <input type={type} id={name} name={name} value={value ?? ''} onChange={onChange} required={required} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
        }
      </div>
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={appointment ? t('editAppointment') : t('addAppointment')} t={t}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label={t('patientName')} name="patientName" value={formData.patientName} onChange={handleChange} required />
            <InputField label={t('phoneNumber')} name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleChange} />
        </div>
        
        {appointment && formData.phoneNumber && (
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t('contactPatient')}</label>
                <div className="flex items-center space-x-2">
                    <a href={`tel:${formData.phoneNumber}`} className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                        <PhoneIcon className="h-5 w-5 me-2 text-slate-500" />
                        {t('call')}
                    </a>
                    <a href={`https://wa.me/${formData.phoneNumber.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-500 hover:bg-green-600 transition-colors">
                        <WhatsAppIcon className="h-5 w-5 me-2" />
                        {t('whatsApp')}
                    </a>
                    <button type="button" onClick={handleShareContact} className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                        <ShareIcon className="h-5 w-5 me-2 text-slate-500" />
                        {t('sendDetails')}
                    </button>
                </div>
            </div>
        )}

        <div className="grid grid-cols-2 gap-4">
            <InputField label={t('date')} name="date">
                 <input type="date" id="date" name="date" value={formData.dateTime.toISOString().split('T')[0]} onChange={handleDateChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
            </InputField>
             <InputField label={t('time')} name="time">
                 <input type="time" id="time" name="time" value={formData.dateTime.toTimeString().substring(0,5)} onChange={handleTimeChange} step="1800" required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
            </InputField>
        </div>
        
        <div>
          <label htmlFor="chiefComplaint" className="block text-sm font-medium text-slate-700">{t('chiefComplaint')}</label>
          <div className="flex items-center space-x-2 mt-1">
              <input 
                  type="text" 
                  id="chiefComplaint" 
                  name="chiefComplaint" 
                  value={formData.chiefComplaint} 
                  onChange={handleChange} 
                  className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" 
              />
              <button
                  type="button"
                  onClick={handleSmartFill}
                  disabled={isSmartFilling}
                  className="flex-shrink-0 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-secondary hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:bg-slate-400 disabled:cursor-not-allowed"
                  title={t('smartFill')}
              >
                  {isSmartFilling ? (
                      <>
                          <SpinnerIcon className="animate-spin -ms-1 me-2 h-4 w-4" />
                          {t('smartFilling')}
                      </>
                  ) : (
                      <>
                          <SparklesIcon className="-ms-1 me-2 h-4 w-4" />
                          {t('smartFill')}
                      </>
                  )}
              </button>
          </div>
        </div>

        <InputField label={t('workDone')} name="workDone" value={formData.workDone} onChange={handleChange} required />
        
        <div className="grid grid-cols-2 gap-4">
            <InputField label={`${t('paymentDone')} ($)`} name="paymentDone" type="number" value={formData.paymentDone} onChange={handleChange} />
            <InputField label={`${t('paymentDue')} ($)`} name="paymentDue" type="number" value={formData.paymentDue} onChange={handleChange} />
        </div>
        
        <div className="mt-2 flex items-center">
            <input id="isPaid" name="isPaid" type="checkbox" checked={formData.isPaid} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
            <label htmlFor="isPaid" className="ms-2 block text-sm text-slate-900">{t('visitPaid')}</label>
        </div>
        
        <div>
            <label className="block text-sm font-medium text-slate-700">{t('dentalChart')} ({t('selected')}: {formData.selectedTeeth?.length})</label>
            <DentalChart selectedTeeth={formData.selectedTeeth || []} onTeethChange={(teeth) => setFormData(prev => ({...prev, selectedTeeth: teeth}))} />
        </div>

        <div className="grid grid-cols-2 gap-4 items-start">
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700">{t('notes')}</label>
            <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={4} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"></textarea>
          </div>
          <div>
            <div>
              <label className="block text-sm font-medium text-slate-700">{t('xrayImage')}</label>
              <div className="mt-1 flex items-center">
                  <label htmlFor="xray-upload" className="cursor-pointer bg-white py-2 px-3 border border-slate-300 rounded-md shadow-sm text-sm leading-4 font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                      <CameraIcon className="w-5 h-5 inline-block me-2" />
                      <span>{t('upload')}</span>
                      <input id="xray-upload" name="xray-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                  </label>
                  {formData.xrayImageUrl && (
                      <img src={formData.xrayImageUrl} alt="X-Ray Preview" className="ms-4 h-16 w-16 object-cover rounded-md border border-slate-200" />
                  )}
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">{t('attachments')}</label>
          <div className="mt-1">
              <label htmlFor="attachments-upload" className="cursor-pointer bg-white py-2 px-3 border border-slate-300 rounded-md shadow-sm text-sm leading-4 font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary inline-flex items-center">
                  <PaperclipIcon className="w-5 h-5 inline-block me-2" />
                  <span>{t('addFiles')}</span>
                  <input id="attachments-upload" name="attachments-upload" type="file" className="sr-only" multiple onChange={handleFileChange} />
              </label>
          </div>
          {formData.attachments && formData.attachments.length > 0 && (
              <div className="mt-3 space-y-2 max-h-32 overflow-y-auto">
                  {formData.attachments.map(file => (
                      <div key={file.id} className="flex items-center justify-between bg-slate-50 p-2 rounded-md border border-slate-200">
                          <a href={file.data} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-primary hover:underline truncate" title={file.name}>
                              <PaperclipIcon className="w-4 h-4 me-2 flex-shrink-0" />
                              <span className="truncate">{file.name}</span>
                          </a>
                          <button type="button" onClick={() => handleRemoveAttachment(file.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full flex-shrink-0">
                              <TrashIcon className="w-4 h-4" />
                              <span className="sr-only">Remove {file.name}</span>
                          </button>
                      </div>
                  ))}
              </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">{t('cancel')}</button>
          <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-sky-600">{t('saveAppointment')}</button>
        </div>
      </form>
    </Modal>
  );
};

export default AppointmentForm;