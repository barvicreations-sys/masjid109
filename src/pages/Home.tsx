import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'motion/react';
import { Page } from '../components/MainLayout';
import { GraduationCap, ShieldCheck, UserCheck } from 'lucide-react';

interface HomeProps {
  navigateTo: (page: Page, profileId?: string) => void;
}

export default function Home({ navigateTo }: HomeProps) {
  const { t } = useLanguage();

  const profiles = [
    {
      id: 'zair-e-nigrani',
      name: t.profiles.left,
      role: 'SUPERVISION',
      icon: <ShieldCheck size={48} className="text-primary-green" />,
      color: 'bg-white',
      border: 'border-slate-100'
    },
    {
      id: 'faizan-nazar',
      name: t.profiles.center,
      role: 'MANAGEMENT',
      icon: <GraduationCap size={64} className="text-primary-green" />,
      color: 'bg-white',
      border: 'border-accent-gold'
    },
    {
      id: 'moallim',
      name: t.profiles.right,
      role: 'TEACHER',
      icon: <UserCheck size={48} className="text-primary-green" />,
      color: 'bg-white',
      border: 'border-slate-100'
    }
  ];

  return (
    <div className="flex flex-col items-center space-y-16 py-12">
      <section className="w-full py-12 bg-linear-to-b from-slate-100 to-paper-white border-y border-slate-200/50">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24 px-4">
          <ProfileCircle
            profile={profiles[0]}
            onClick={() => navigateTo('profile-detail', profiles[0].id)}
          />

          <ProfileCircle
            profile={profiles[1]}
            isLarge
            onClick={() => navigateTo('profile-detail', profiles[1].id)}
          />

          <ProfileCircle
            profile={profiles[2]}
            onClick={() => navigateTo('profile-detail', profiles[2].id)}
          />
        </div>
      </section>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-5xl px-4">
        <div className="space-y-6">
           <LoginBox 
              title="Student Portal" 
              urduTitle="طلباء پورٹل" 
              onClick={() => navigateTo('login')} 
              icon={<GraduationCap size={32} />}
              primary
           />
           <LoginBox 
              title="Admin Portal" 
              urduTitle="ایڈمن پورٹل" 
              onClick={() => navigateTo('login')} 
              icon={<ShieldCheck size={32} />}
           />
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-1 h-full bg-primary-green"></div>
           <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
              <strong className="text-xl urdu-text text-primary-green">{t.finance_system}</strong>
              <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-tighter">Live Monitor</span>
           </div>
           
           <div className="space-y-6 mt-4">
              <div className="flex justify-between items-end border-b border-slate-50 pb-2">
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Month Income</p>
                    <p className="text-sm font-bold text-slate-600 urdu-text">کل آمدن</p>
                 </div>
                 <p className="text-2xl font-black text-primary-green font-mono">Rs. 245,000</p>
              </div>

              <div className="flex justify-between items-end border-b border-slate-50 pb-2">
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly Expenses</p>
                    <p className="text-sm font-bold text-slate-600 urdu-text">کل اخراجات</p>
                 </div>
                 <p className="text-2xl font-black text-red-600 font-mono">Rs. 89,500</p>
              </div>
           </div>

           <div className="mt-8 pt-8 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-400 urdu-text opacity-60 mb-4">
                تازہ ترین رپورٹ: روزانہ / ہفتہ وار / ماہانہ
              </p>
              <div className="flex gap-1 h-1.5">
                 <div className="flex-1 bg-primary-green rounded-full"></div>
                 <div className="w-12 bg-accent-gold rounded-full"></div>
                 <div className="w-4 bg-slate-200 rounded-full"></div>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}

function LoginBox({ title, urduTitle, onClick, icon, primary }: { title: string, urduTitle: string, onClick: () => void, icon: React.ReactNode, primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full group relative bg-white p-8 rounded-2xl border ${primary ? 'border-primary-green' : 'border-slate-800'} text-left rtl:text-right overflow-hidden transition-all hover:translate-x-2 rtl:hover:-translate-x-2 shadow-lg shadow-slate-200/20`}
    >
      <div className={`absolute top-0 left-0 w-1 h-full ${primary ? 'bg-primary-green' : 'bg-slate-800'}`}></div>
      <div className="flex justify-between items-center">
         <div>
            <p className={`text-sm font-black uppercase tracking-widest mb-1 ${primary ? 'text-primary-green' : 'text-slate-800'}`}>{title}</p>
            <h3 className={`text-3xl font-black urdu-text ${primary ? 'text-primary-green' : 'text-slate-800'}`}>{urduTitle}</h3>
         </div>
         <div className={`opacity-20 group-hover:opacity-100 transition-all ${primary ? 'text-primary-green' : 'text-slate-800'}`}>
            {icon}
         </div>
      </div>
    </button>
  );
}

function ProfileCircle({ profile, onClick, isLarge }: { profile: any, onClick: () => void, isLarge?: boolean }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center space-y-4"
    >
      <div className={`${isLarge ? 'w-44 h-44 border-accent-gold border-4 shadow-accent-gold/20' : 'w-32 h-32 border-white shadow-slate-300'} bg-white rounded-full flex items-center justify-center shadow-2xl relative group overflow-hidden`}>
         <div className="absolute inset-0 bg-linear-to-tr from-slate-50 to-white opacity-50"></div>
         <div className="relative z-10 transition-transform group-hover:scale-110 duration-500">
           {profile.icon}
         </div>
      </div>
      <div className="text-center">
        <p className="text-[10px] font-black tracking-widest text-accent-gold uppercase mb-1">{profile.role}</p>
        <h4 className={`${isLarge ? 'text-2xl' : 'text-lg'} font-black urdu-text text-primary-green`}>{profile.name}</h4>
      </div>
    </motion.button>
  );
}
