import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { Student, AttendanceRecord, DailyReport } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  BookOpen, 
  ClipboardCheck, 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Search, 
  Calendar,
  UserCheck
} from 'lucide-react';
import { Page } from '../components/MainLayout';
import { format } from 'date-fns';

interface AdminDashboardProps {
  navigateTo: (page: Page) => void;
}

type AdminTab = 'students' | 'attendance' | 'lessons' | 'reports';

export default function AdminDashboard({ navigateTo }: AdminDashboardProps) {
  const { t, isRTL } = useLanguage();
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('students');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;
    const unsub = onSnapshot(collection(db, 'students'), (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Student));
      setStudents(docs);
      setLoading(false);
    });
    return unsub;
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
        <p>You must be an admin to view this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-bold text-emerald-900">{t.admin_panel}</h2>
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-emerald-100 overflow-hidden">
          <TabButton active={activeTab === 'students'} onClick={() => setActiveTab('students')} icon={<Users size={18} />} label={t.admin.student_management} />
          <TabButton active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} icon={<ClipboardCheck size={18} />} label={t.admin.attendance} />
          <TabButton active={activeTab === 'lessons'} onClick={() => setActiveTab('lessons')} icon={<BookOpen size={18} />} label={t.admin.lesson_entry} />
          <TabButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon={<FileText size={18} />} label={t.student.reports} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
           key={activeTab}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
           className="bg-white rounded-3xl shadow-lg border border-emerald-100 p-6 md:p-8"
        >
          {activeTab === 'students' && <StudentManagement students={students} />}
          {activeTab === 'attendance' && <AttendanceSystem students={students} />}
          {activeTab === 'lessons' && <LessonEntry students={students} />}
          {activeTab === 'reports' && <AdminReports students={students} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-lg transition-all ${active ? 'bg-primary-green text-white shadow-md' : 'text-slate-600 hover:bg-emerald-50'}`}
    >
      {icon}
      <span className="text-sm font-bold hidden md:block">{label}</span>
    </button>
  );
}

// Sub-components (Simplified versions due to space, expandable)

function StudentManagement({ students }: { students: Student[] }) {
  const { t, isRTL } = useLanguage();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<Student>>({
    name: '',
    fatherName: '',
    caste: '',
    age: 0,
    address: '',
    phoneNumber: '',
    gmail: '',
    dateOfAdmission: format(new Date(), 'yyyy-MM-dd'),
    reference: ''
  });

  const handleSave = async () => {
    if (!formData.name) return alert('Name is required');
    setSaving(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, 'students', editingId), formData);
      } else {
        const studentId = `JAMIA-${Date.now().toString().slice(-6)}`;
        await addDoc(collection(db, 'students'), { ...formData, studentId });
      }
      setIsAdding(false);
      setEditingId(null);
      setFormData({ name: '', fatherName: '', caste: '', age: 0, address: '', phoneNumber: '', gmail: '', dateOfAdmission: format(new Date(), 'yyyy-MM-dd'), reference: '' });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'students');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(isRTL ? 'کیا آپ واقعی اسے حذف کرنا چاہتے ہیں؟' : 'Are you sure you want to delete this student?')) {
      await deleteDoc(doc(db, 'students', id));
    }
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 rtl:right-3 rtl:left-auto" />
          <input
            type="text"
            placeholder={isRTL ? 'تلاش کریں (نام یا آئی ڈی)...' : 'Search by name or ID...'}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none rtl:pr-10 rtl:pl-4"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2 rtl:space-x-reverse bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-emerald-100"
        >
          <Plus size={20} />
          <span>{isRTL ? 'نیا اسٹوڈنٹ' : 'Add Student'}</span>
        </button>
      </div>

      {(isAdding || editingId) && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 mb-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <InputField label={t.student.name} value={formData.name || ''} onChange={v => setFormData({...formData, name: v})} />
              <InputField label={t.student.father_name} value={formData.fatherName || ''} onChange={v => setFormData({...formData, fatherName: v})} />
              <InputField label={t.student.caste} value={formData.caste || ''} onChange={v => setFormData({...formData, caste: v})} />
              <InputField label={t.student.age} type="number" value={formData.age?.toString() || ''} onChange={v => setFormData({...formData, age: Number(v)})} />
              <InputField label={t.student.phone} value={formData.phoneNumber || ''} onChange={v => setFormData({...formData, phoneNumber: v})} />
              <InputField label={t.student.gmail} value={formData.gmail || ''} onChange={v => setFormData({...formData, gmail: v})} />
              <InputField label={t.student.admission_date} type="date" value={formData.dateOfAdmission || ''} onChange={v => setFormData({...formData, dateOfAdmission: v})} />
              <InputField label={t.student.reference} value={formData.reference || ''} onChange={v => setFormData({...formData, reference: v})} />
              <div className="md:col-span-3">
                 <InputField label={t.student.address} value={formData.address || ''} onChange={v => setFormData({...formData, address: v})} />
              </div>
           </div>
           <div className="flex justify-end space-x-3 rtl:space-x-reverse">
              <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="px-6 py-2 text-slate-600 font-bold">{t.admin.delete}</button>
              <button 
                onClick={handleSave} 
                disabled={saving}
                className="bg-primary-green text-white px-8 py-2 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-primary-green/20"
              >
                <Save size={18} />
                {saving ? (isRTL ? 'محفوظ ہو رہا ہے...' : 'Saving...') : (isRTL ? 'محفوظ کریں' : 'Save')}
              </button>
           </div>
        </motion.div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-100">
        <table className="w-full text-left rtl:text-right">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase letter-spacing-wider font-bold">
            <tr>
              <th className="px-6 py-4">{t.student.id}</th>
              <th className="px-6 py-4">{t.student.name}</th>
              <th className="px-6 py-4">{t.student.father_name}</th>
              <th className="px-6 py-4">{t.student.phone}</th>
              <th className="px-6 py-4 text-center">{isRTL ? 'ایکشن' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents.map(s => (
              <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs">{s.studentId}</td>
                <td className="px-6 py-4 font-bold text-emerald-900">{s.name}</td>
                <td className="px-6 py-4 text-slate-600">{s.fatherName}</td>
                <td className="px-6 py-4 text-slate-500">{s.phoneNumber}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-center space-x-2 rtl:space-x-reverse">
                    <button onClick={() => { setEditingId(s.id); setFormData(s); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(s.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AttendanceSystem({ students }: { students: Student[] }) {
  const { isRTL } = useLanguage();
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'leave'>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'attendance'), where('date', '==', date));
        const snap = await getDocs(q);
        const map: Record<string, 'present' | 'absent' | 'leave'> = {};
        snap.forEach(doc => {
          const data = doc.data();
          map[data.studentId] = data.status;
        });
        setAttendance(map);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [date]);

  const markAttendance = async (studentId: string, status: 'present' | 'absent' | 'leave') => {
    try {
      const q = query(collection(db, 'attendance'), where('studentId', '==', studentId), where('date', '==', date));
      const snap = await getDocs(q);
      if (snap.empty) {
        await addDoc(collection(db, 'attendance'), { studentId, date, status });
      } else {
        await updateDoc(doc(db, 'attendance', snap.docs[0].id), { status });
      }
      setAttendance(prev => ({ ...prev, [studentId]: status }));
    } catch (e) {
       handleFirestoreError(e, OperationType.WRITE, 'attendance');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 rtl:space-x-reverse mb-8">
        <Calendar className="text-emerald-700" />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading attendance...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map(s => (
            <div key={s.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between shadow-sm">
              <div>
                <p className="font-bold text-emerald-900">{s.name}</p>
                <p className="text-xs text-slate-500 font-mono">{s.studentId}</p>
              </div>
              <div className="flex space-x-1 rtl:space-x-reverse">
                <StatusBtn active={attendance[s.id] === 'present'} color="bg-green-100 text-green-700" onClick={() => markAttendance(s.id, 'present')} label="P" />
                <StatusBtn active={attendance[s.id] === 'absent'} color="bg-red-100 text-red-700" onClick={() => markAttendance(s.id, 'absent')} label="A" />
                <StatusBtn active={attendance[s.id] === 'leave'} color="bg-yellow-100 text-yellow-700" onClick={() => markAttendance(s.id, 'leave')} label="L" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBtn({ active, color, onClick, label }: { active: boolean, color: string, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all ${active ? color : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
    >
      {label}
    </button>
  );
}

function LessonEntry({ students }: { students: Student[] }) {
  const { t, isRTL } = useLanguage();
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [lessonData, setLessonData] = useState<Partial<DailyReport>>({
    sabak: '', sabqi: '', manzil: '', duain: '',
    namaz: { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false }
  });

  const handleSave = async () => {
    if (!selectedStudent) return;
    try {
      const q = query(collection(db, 'dailyReports'), where('studentId', '==', selectedStudent), where('date', '==', date));
      const snap = await getDocs(q);
      const data = { ...lessonData, studentId: selectedStudent, date, updatedAt: new Date().toISOString() };
      if (snap.empty) {
        await addDoc(collection(db, 'dailyReports'), data);
      } else {
        await updateDoc(doc(db, 'dailyReports', snap.docs[0].id), data);
      }
      alert(isRTL ? 'رپورٹ محفوظ ہو گئی!' : 'Report saved!');
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'dailyReports');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1 space-y-4">
        <div className="mb-4">
          <label className="block text-sm font-bold text-slate-500 mb-2">{isRTL ? 'تاریخ منتخب کریں' : 'Select Date'}</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl" />
        </div>
        <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {students.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedStudent(s.id)}
              className={`w-full text-left rtl:text-right p-4 rounded-xl border transition-all ${selectedStudent === s.id ? 'bg-primary-green text-white border-primary-green shadow-md' : 'bg-white border-slate-100 text-emerald-900 hover:border-emerald-200'}`}
            >
              <p className="font-bold">{s.name}</p>
              <p className={`text-xs opacity-60 font-mono`}>{s.studentId}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="md:col-span-2 bg-slate-50 p-6 rounded-2xl border border-slate-100">
        {selectedStudent ? (
          <div className="space-y-6">
            <h4 className="text-xl font-bold text-emerald-900 border-b border-emerald-200 pb-2">
              {students.find(s => s.id === selectedStudent)?.name} - {date}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <InputField label={t.student.sabak} value={lessonData.sabak || ''} onChange={v => setLessonData({...lessonData, sabak: v})} />
               <InputField label={t.student.sabqi} value={lessonData.sabqi || ''} onChange={v => setLessonData({...lessonData, sabqi: v})} />
               <InputField label={t.student.manzil} value={lessonData.manzil || ''} onChange={v => setLessonData({...lessonData, manzil: v})} />
               <InputField label={t.student.duain} value={lessonData.duain || ''} onChange={v => setLessonData({...lessonData, duain: v})} />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-500 mb-4">{t.student.namaz}</label>
              <div className="flex flex-wrap gap-4">
                {['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map(p => (
                  <label key={p} className="flex items-center space-x-2 rtl:space-x-reverse bg-white px-4 py-2 rounded-xl border border-slate-200 cursor-pointer hover:bg-emerald-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={(lessonData.namaz as any)?.[p] || false}
                      onChange={e => setLessonData({...lessonData, namaz: {...(lessonData.namaz || {}), [p]: e.target.checked}} as any)}
                      className="w-5 h-5 accent-emerald-600"
                    />
                    <span className="capitalize text-sm font-bold text-emerald-800">{p}</span>
                  </label>
                ))}
              </div>
            </div>

            <button 
              onClick={handleSave} 
              disabled={saving}
              className="w-full bg-primary-green text-white font-bold py-4 rounded-2xl hover:bg-emerald-800 transition-all shadow-lg shadow-primary-green/20 disabled:opacity-50"
            >
              {saving ? (isRTL ? 'رپورٹ محفوظ ہو رہی ہے...' : 'Saving Report...') : (isRTL ? 'رپورٹ محفوظ کریں' : 'Save Report')}
            </button>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
            <UserCheck size={64} opacity={0.2} />
            <p>{isRTL ? 'انتخاب کریں' : 'Select a student to enter lesson'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminReports({ students }: { students: Student[] }) {
   const { t, isRTL } = useLanguage();
   const [filterType, setFilterType] = useState('daily');
   const [stats, setStats] = useState({
     totalStudents: students.length,
     avgAttendance: 0,
     lessonsCompleted: 0,
     newAdmissions: 0
   });
   const [loading, setLoading] = useState(true);

   useEffect(() => {
     const fetchReportData = async () => {
       setLoading(true);
       try {
         // Get current month's start date
         const now = new Date();
         const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
         
         const [attendanceSnap, reportsSnap] = await Promise.all([
           getDocs(query(collection(db, 'attendance'), where('date', '>=', firstDay))),
           getDocs(query(collection(db, 'dailyReports'), where('date', '>=', firstDay)))
         ]);

         const attendance = attendanceSnap.docs.map(d => d.data());
         const reports = reportsSnap.docs.map(d => d.data());

         const totalChecks = attendance.length;
         const presents = attendance.filter(a => a.status === 'present').length;
         const avgAtt = totalChecks > 0 ? Math.round((presents / totalChecks) * 100) : 0;

         // Count new admissions this month (naive check based on dateOfAdmission)
         const monthPrefix = format(now, 'yyyy-MM');
         const newAdm = students.filter(s => s.dateOfAdmission?.startsWith(monthPrefix)).length;

         setStats({
           totalStudents: students.length,
           avgAttendance: avgAtt,
           lessonsCompleted: reports.length,
           newAdmissions: newAdm
         });
       } catch (e) {
         console.error(e);
       } finally {
         setLoading(false);
       }
     };
     fetchReportData();
   }, [students]);

   return (
     <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center bg-slate-50 p-4 rounded-2xl gap-4">
           <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
              {['daily', 'weekly', 'monthly', 'yearly'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilterType(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterType === f ? 'bg-emerald-700 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  {t.student[f as keyof typeof t.student] || f}
                </button>
              ))}
           </div>
           <div className="flex gap-2">
              <input type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm" />
              <span className="self-center">to</span>
              <input type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm" />
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           <ReportStat label="Total Students" value={stats.totalStudents} sub="Active" color="bg-emerald-50" />
           <ReportStat label="Avg Attendance" value={`${stats.avgAttendance}%`} sub="This Month" color="bg-blue-50" />
           <ReportStat label="Lessons Completed" value={stats.lessonsCompleted} sub="This Month" color="bg-yellow-50" />
           <ReportStat label="New Admissions" value={stats.newAdmissions} sub="This Month" color="bg-purple-50" />
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
           <div className="p-6 bg-slate-50 border-b border-white font-bold text-emerald-900">
              {isRTL ? 'طلبہ کی کارکردگی' : 'Student Performance Overview'}
           </div>
           <div className="p-6">
              {loading ? (
                <div className="h-40 flex items-center justify-center text-slate-300">Loading metrics...</div>
              ) : (
                <>
                  <div className="h-40 flex items-end justify-between gap-2">
                    {[40, 70, 45, 90, 65, 80, 55, 75, 60, 85].map((h, i) => (
                      <div key={i} className="flex-grow bg-emerald-100 rounded-t-lg transition-all hover:bg-emerald-500 flex flex-col justify-end group">
                          <div className="invisible group-hover:visible bg-emerald-900 text-white text-[10px] p-1 rounded mb-1 text-center font-mono">{h}%</div>
                          <div className="bg-emerald-600 rounded-t-lg" style={{ height: `${h}%` }}></div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest px-2">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>
                </>
              )}
           </div>
        </div>
     </div>
   );
}

function ReportStat({ label, value, sub, color }: { label: string, value: string | number, sub: string, color: string }) {
  return (
    <div className={`${color} p-6 rounded-3xl border border-white/50 shadow-sm`}>
       <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
       <p className="text-3xl font-black text-slate-900 mb-1">{value}</p>
       <p className="text-[10px] font-bold text-slate-500">{sub}</p>
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
        className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
      />
    </div>
  );
}


