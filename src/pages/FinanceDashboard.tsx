import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, onSnapshot, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { FinanceRecord } from '../types';
import { motion } from 'motion/react';
import { Plus, Trash2, ArrowUpCircle, ArrowDownCircle, DollarSign, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';

export default function FinanceDashboard() {
  const { t, isRTL } = useLanguage();
  const { isAdmin } = useAuth();
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<FinanceRecord>>({
    type: 'income',
    amount: 0,
    description: '',
    name: '',
    date: new Date().toISOString()
  });

  useEffect(() => {
    if (!isAdmin) return;
    const unsub = onSnapshot(collection(db, 'finance'), (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FinanceRecord));
      setRecords(docs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setLoading(false);
    });
    return unsub;
  }, [isAdmin]);

  const totalIncome = records.filter(r => r.type === 'income').reduce((acc, r) => acc + r.amount, 0);
  const totalExpense = records.filter(r => r.type === 'expense').reduce((acc, r) => acc + r.amount, 0);
  const balance = totalIncome - totalExpense;

  const handleSave = async () => {
    if (formData.amount! <= 0) return alert('Amount must be greater than 0');
    setSaving(true);
    try {
      await addDoc(collection(db, 'finance'), { ...formData, date: new Date().toISOString() });
      setIsAdding(false);
      setFormData({ type: 'income', amount: 0, description: '', name: '', date: new Date().toISOString() });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'finance');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(isRTL ? 'کیا آپ حذف کرنا چاہتے ہیں؟' : 'Are you sure?')) {
      await deleteDoc(doc(db, 'finance', id));
    }
  };

  if (!isAdmin) return <div className="text-center py-20 font-bold text-red-600">Access Denied</div>;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-primary-green urdu-text">{t.finance_system}</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-primary-green text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-900 transition-all shadow-lg shadow-primary-green/20"
        >
          <Plus size={20} />
          <span>{isRTL ? 'اندراج کریں' : 'Add Record'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <StatsCard label={t.finance.income} amount={totalIncome} icon={<ArrowUpCircle className="text-green-600" />} color="bg-white border-green-100" textColor="text-green-700" />
         <StatsCard label={t.finance.expense} amount={totalExpense} icon={<ArrowDownCircle className="text-red-600" />} color="bg-white border-red-100" textColor="text-red-700" />
         <StatsCard label={isRTL ? 'باقی رقم' : 'Net Balance'} amount={balance} icon={<DollarSign className="text-accent-gold" />} color="bg-primary-green text-white" textColor="text-white" accent />
      </div>

      {isAdding && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-3xl shadow-xl border border-emerald-100 space-y-4">
           <div className="flex space-x-2 rtl:space-x-reverse mb-4">
              <button
                onClick={() => setFormData({...formData, type: 'income'})}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${formData.type === 'income' ? 'bg-green-600 text-white shadow-md' : 'bg-slate-100 text-slate-500'}`}
              >
                {t.finance.income}
              </button>
              <button
                onClick={() => setFormData({...formData, type: 'expense'})}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${formData.type === 'expense' ? 'bg-red-600 text-white shadow-md' : 'bg-slate-100 text-slate-500'}`}
              >
                {t.finance.expense}
              </button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label={formData.type === 'income' ? t.finance.donor : t.finance.description} value={formData.name || ''} onChange={v => setFormData({...formData, name: v, description: v})} />
              <InputField label={t.finance.amount} type="number" value={formData.amount?.toString() || ''} onChange={v => setFormData({...formData, amount: Number(v)})} />
           </div>
           <div className="flex justify-end space-x-3 rtl:space-x-reverse pt-4">
              <button onClick={() => setIsAdding(false)} className="px-6 py-2 text-slate-500 font-bold">{isRTL ? 'کینسل' : 'Cancel'}</button>
              <button 
                onClick={handleSave} 
                disabled={saving}
                className="bg-primary-green text-white px-12 py-3 rounded-xl font-bold shadow-lg shadow-primary-green/20 disabled:opacity-50"
              >
                {saving ? (isRTL ? 'محفوظ ہو رہا ہے...' : 'Saving...') : (isRTL ? 'محفوظ کریں' : 'Save Record')}
              </button>
           </div>
        </motion.div>
      )}

      <div className="bg-white rounded-3xl shadow-lg border border-emerald-50 overflow-hidden">
        <div className="p-6 border-b border-emerald-50 bg-slate-50/50 flex justify-between items-center">
           <h3 className="font-bold text-emerald-900">{isRTL ? 'حالیہ ٹرانزیکشنز' : 'Recent Transactions'}</h3>
           <FileText size={20} className="text-slate-400" />
        </div>
        <div className="divide-y divide-slate-100">
           {records.length === 0 ? (
             <p className="p-8 text-center text-slate-400">{isRTL ? 'کوئی ریکارڈ موجود نہیں' : 'No records found'}</p>
           ) : (
             records.map(r => (
               <div key={r.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center space-x-4 rtl:space-x-reverse">
                     <div className={`p-3 rounded-2xl ${r.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {r.type === 'income' ? <Plus size={20} /> : <Trash2 size={20} className="rotate-45" />}
                     </div>
                     <div>
                        <p className="font-bold text-emerald-900">{r.name || r.description}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                           <Calendar size={12} />
                           {format(new Date(r.date), 'dd MMM yyyy, hh:mm a')}
                        </p>
                     </div>
                  </div>
                  <div className="flex items-center space-x-6 rtl:space-x-reverse">
                     <p className={`text-xl font-black ${r.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {r.type === 'income' ? '+' : '-'} {r.amount}
                     </p>
                     <button onClick={() => handleDelete(r.id)} className="p-2 text-slate-300 hover:text-red-600 transition-colors">
                        <Trash2 size={18} />
                     </button>
                  </div>
               </div>
             ))
           )}
        </div>
      </div>
    </div>
  );
}

function StatsCard({ label, amount, icon, color, textColor, accent }: { label: string, amount: number, icon: React.ReactNode, color: string, textColor: string, accent?: boolean }) {
  return (
    <div className={`${color} p-8 rounded-3xl border ${accent ? 'border-primary-green' : 'border-slate-100'} shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group`}>
      {accent && <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8"></div>}
      <div className="flex justify-between items-start relative z-10">
        <span className={`text-sm font-bold uppercase tracking-wider ${accent ? 'opacity-80' : 'opacity-60'}`}>{label}</span>
        {icon}
      </div>
      <p className={`text-3xl font-black relative z-10 ${textColor}`}>{amount.toLocaleString()}</p>
    </div>
  );
}

function InputField({ label, type = 'text', value, onChange }: { label: string, type?: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="w-full">
      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
      />
    </div>
  );
}
