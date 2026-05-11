import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore';
import { Student, DailyReport } from '../types';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Award, 
  TrendingUp, 
  FileText, 
  GraduationCap, 
  MapPin, 
  User,
  Clock
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

export default function StudentDashboard() {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ attendanceRate: 0, reportsCount: 0 });
  const [searchId, setSearchId] = useState('');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    // Search for student linked to this user's email or UID
    const findStudent = async () => {
      try {
        const q = query(collection(db, 'students'), where('gmail', '==', user.email));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setStudent({ id: snap.docs[0].id, ...snap.docs[0].data() } as Student);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    findStudent();
  }, [user]);

  useEffect(() => {
    if (!student) return;
    const qReports = query(collection(db, 'dailyReports'), where('studentId', '==', student.id), orderBy('date', 'desc'));
    const unsubReports = onSnapshot(qReports, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as DailyReport));
      setReports(data);
      setStats(prev => ({ ...prev, reportsCount: data.length }));
    });

    const qAttendance = query(collection(db, 'attendance'), where('studentId', '==', student.id), orderBy('date', 'desc'));
    const unsubAttendance = onSnapshot(qAttendance, (snapshot) => {
      const data = snapshot.docs.map(d => d.data());
      setAttendance(data);
      
      const total = data.length;
      const presents = data.filter(a => a.status === 'present').length;
      const rate = total > 0 ? Math.round((presents / total) * 100) : 0;
      setStats(prev => ({ ...prev, attendanceRate: rate }));
    });

    return () => {
      unsubReports();
      unsubAttendance();
    };
  }, [student]);

  const fetchBySearch = async () => {
    setLoading(true);
    const q = query(collection(db, 'students'), where('studentId', '==', searchId.toUpperCase()));
    const snap = await getDocs(q);
    if (!snap.empty) {
      setStudent({ id: snap.docs[0].id, ...snap.docs[0].data() } as Student);
    } else {
      alert(isRTL ? 'کوئی اسٹوڈنٹ نہیں ملا' : 'Student not found');
    }
    setLoading(false);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-700"></div></div>;

  if (!student) {
    return (
      <div className="max-w-md mx-auto py-12">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-emerald-100 text-center">
          <BookOpen size={48} className="mx-auto text-emerald-600 mb-6" />
          <h2 className="text-2xl font-bold text-emerald-900 mb-4">{isRTL ? 'اپنا ریکارڈ تلاش کریں' : 'Find Your Record'}</h2>
          <p className="text-slate-500 mb-6">{isRTL ? 'رپورٹ دیکھنے کے لیے اپنی اسٹوڈنٹ آئی ڈی درج کریں' : 'Enter your Student ID to view reports'}</p>
          <div className="flex space-x-2 rtl:space-x-reverse">
            <input
              type="text"
              placeholder="JAMIA-XXXXXX"
              value={searchId}
              onChange={e => setSearchId(e.target.value)}
              className="flex-grow bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-center uppercase"
            />
            <button onClick={fetchBySearch} className="bg-emerald-700 text-white p-3 rounded-xl hover:bg-emerald-800 transition-all">
              <Search size={24} />
            </button>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col items-center">
             <p className="text-xs text-slate-400 mb-4 uppercase tracking-widest">{isRTL ? 'یا' : 'OR'}</p>
             <p className="text-sm text-slate-500">{isRTL ? 'اپنے Gmail اکاؤنٹ سے لاگ ان کریں اگر وہ لنک ہے' : 'Login with your Gmail if it is linked to your profile'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Student Profile Overview */}
      <div className="bg-emerald-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
           <GraduationCap size={160} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
           <div className="w-32 h-32 bg-emerald-700 rounded-2xl flex items-center justify-center text-4xl font-bold border-2 border-emerald-600 shadow-inner">
             {student.name.charAt(0)}
           </div>
           <div className="text-center md:text-left rtl:md:text-right">
             <h2 className="text-4xl font-bold mb-1">{student.name}</h2>
             <p className="text-emerald-200 font-mono tracking-wider">{student.studentId}</p>
             <div className="flex flex-wrap gap-4 mt-6">
                <ProfileBadge icon={<User size={14} />} label={student.fatherName} />
                <ProfileBadge icon={<Calendar size={14} />} label={student.dateOfAdmission} />
                <ProfileBadge icon={<MapPin size={14} />} label={student.address} />
             </div>
           </div>
        </div>
      </div>

      {/* Reports Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-6">
            <h3 className="text-2xl font-bold text-emerald-900 flex items-center gap-2">
               <FileText className="text-emerald-600" />
               {t.student.reports}
            </h3>

            <div className="space-y-4">
               {reports.length === 0 ? (
                 <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center text-slate-400">
                    {isRTL ? 'کوئی رپورٹس نہیں ملیں' : 'No reports found yet'}
                 </div>
               ) : (
                 reports.map(r => (
                   <motion.div
                     initial={{ opacity: 0, y: 10 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     key={r.id}
                     className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-50 hover:border-emerald-200 transition-all"
                   >
                     <div className="flex justify-between items-center mb-4 pb-2 border-b border-emerald-50">
                        <span className="font-bold text-emerald-800">{format(new Date(r.date), 'EEEE, dd MMMM yyyy')}</span>
                        <div className="flex gap-1">
                           {Object.entries(r.namaz).map(([n, present]) => (
                             <div key={n} title={n.toUpperCase()} className={`w-3 h-3 rounded-full ${present ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                           ))}
                        </div>
                     </div>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <ReportField label={t.student.sabak} value={r.sabak} />
                        <ReportField label={t.student.sabqi} value={r.sabqi} />
                        <ReportField label={t.student.manzil} value={r.manzil} />
                        <ReportField label={t.student.duain} value={r.duain} />
                     </div>
                   </motion.div>
                 ))
               )}
            </div>
         </div>

         <div className="space-y-6">
            <h3 className="text-2xl font-bold text-emerald-900 flex items-center gap-2">
               <TrendingUp className="text-emerald-600" />
               {isRTL ? 'خلاصہ' : 'Summary'}
            </h3>
             <div className="bg-white p-6 rounded-3xl shadow-lg border border-emerald-50 space-y-6">
               <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">{isRTL ? 'حاضری' : 'Attendance'}</span>
                  <span className="text-emerald-700 font-mono text-2xl font-black">{stats.attendanceRate}%</span>
               </div>
               <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                     <span className="text-slate-600">{isRTL ? 'سبق کی رفتار' : 'Lesson Progress'}</span>
                     <span className="font-bold text-emerald-600">
                        {stats.attendanceRate > 90 ? 'Excellent' : stats.attendanceRate > 75 ? 'Good' : 'Needs Work'}
                     </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                     <div 
                        className="bg-emerald-600 h-full rounded-full shadow-sm transition-all duration-1000" 
                        style={{ width: `${stats.attendanceRate}%` }}
                      ></div>
                  </div>
               </div>
               <div className="pt-4 border-t border-slate-50">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{isRTL ? 'حالیہ حاضری' : 'Recent Attendance'}</h4>
                  <div className="flex gap-1">
                     {attendance.slice(0, 7).map((a, i) => (
                        <div 
                           key={i} 
                           title={a.date}
                           className={`flex-1 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                              a.status === 'present' ? 'bg-green-100 text-green-700' : 
                              a.status === 'absent' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                           }`}
                        >
                           {a.status.charAt(0).toUpperCase()}
                        </div>
                     ))}
                  </div>
               </div>
               <div className="pt-4 border-t border-slate-50 flex items-center gap-2 text-yellow-600 font-bold">
                  <Award size={20} />
                  <span>{stats.attendanceRate > 80 ? (isRTL ? 'آپ کی کارکردگی شاندار ہے!' : 'Great performance!') : (isRTL ? 'مزید محنت کریں' : 'Keep working hard!')}</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function ProfileBadge({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex items-center space-x-2 rtl:space-x-reverse bg-emerald-700/50 px-3 py-1.5 rounded-lg text-xs font-medium border border-emerald-600/50">
      {icon}
      <span>{label}</span>
    </div>
  );
}

function ReportField({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-wider">{label}</p>
      <p className="text-sm text-emerald-900 font-semibold">{value || '---'}</p>
    </div>
  );
}


