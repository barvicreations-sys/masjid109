import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { signInWithGoogle } from '../lib/firebase';
import { motion } from 'motion/react';
import { GraduationCap, ShieldCheck } from 'lucide-react';
import { Page } from '../components/MainLayout';

interface LoginProps {
  navigateTo: (page: Page) => void;
}

export default function Login({ navigateTo }: LoginProps) {
  const { t, isRTL } = useLanguage();
  const { user, isAdmin } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (type: 'student' | 'admin') => {
    setLoading(true);
    setError(null);
    try {
      const loggedUser = await signInWithGoogle();
      if (type === 'admin' && loggedUser.email === 'barvicreations@gmail.com') {
         navigateTo('admin-dashboard');
      } else if (type === 'student') {
         navigateTo('student-dashboard');
      } else {
        // If they tried admin but aren't authorized
        if (type === 'admin') {
           setError(isRTL ? 'آپ کے پاس ایڈمن رسائی نہیں ہے۔' : 'You do not have admin access.');
        } else {
           navigateTo('student-dashboard');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-black text-primary-green mb-4 uppercase tracking-tighter">{t.login}</h2>
        <div className="h-1.5 w-24 bg-accent-gold mx-auto mb-6"></div>
        <p className="text-slate-600 font-bold urdu-text text-lg">{isRTL ? 'اپنے اکاؤنٹ تک رسائی کے لیے لاگ ان کریں' : 'Login to access your account'}</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl mb-12 border-2 border-red-100 text-center font-bold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Student login */}
        <motion.div
           whileHover={{ y: -8 }}
           className="bg-white rounded-2xl shadow-2xl shadow-slate-200 border border-slate-100 p-10 flex flex-col items-center justify-between relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-primary-green"></div>
          <div className="text-center w-full">
            <div className="mx-auto w-24 h-24 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center mb-8 group-hover:rotate-6 transition-transform">
              <GraduationCap size={44} className="text-primary-green" />
            </div>
            <h3 className="text-3xl font-black text-primary-green mb-3 urdu-text">{t.student_login}</h3>
            <p className="text-slate-500 font-medium leading-relaxed mb-10">{isRTL ? 'طلبہ اپنی تعلیمی رپورٹ اور حاضری دیکھ سکتے ہیں' : 'Students can view their educational reports and attendance'}</p>
          </div>
          <button
            disabled={loading}
            onClick={() => handleLogin('student')}
            className="w-full bg-primary-green hover:bg-emerald-950 text-white font-black py-5 rounded-xl transition-all shadow-xl shadow-primary-green/20 disabled:opacity-50 uppercase tracking-widest text-sm"
          >
            {loading ? 'Processing...' : (isRTL ? 'Google سے لاگ ان کریں' : 'Login with Google')}
          </button>
        </motion.div>

        {/* Admin login */}
        <motion.div
           whileHover={{ y: -8 }}
           className="bg-white rounded-2xl shadow-2xl shadow-slate-200 border border-slate-100 p-10 flex flex-col items-center justify-between relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-accent-gold"></div>
          <div className="text-center w-full">
            <div className="mx-auto w-24 h-24 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center mb-8 group-hover:-rotate-6 transition-transform">
              <ShieldCheck size={44} className="text-accent-gold" />
            </div>
            <h3 className="text-3xl font-black text-primary-green mb-3 urdu-text">{t.admin_login}</h3>
            <p className="text-slate-500 font-medium leading-relaxed mb-10">{isRTL ? 'ایڈمن طلبہ کا ڈیٹا اور فنانس منظم کر سکتے ہیں' : 'Admins can manage student data and finances'}</p>
          </div>
          <button
            disabled={loading}
            onClick={() => handleLogin('admin')}
            className="w-full bg-ink-black hover:bg-black text-white font-black py-5 rounded-xl transition-all shadow-xl shadow-black/20 disabled:opacity-50 uppercase tracking-widest text-sm"
          >
             {loading ? 'Processing...' : (isRTL ? 'Google سے لاگ ان کریں' : 'Login with Google')}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
