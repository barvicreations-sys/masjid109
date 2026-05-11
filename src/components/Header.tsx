import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { LogOut, Globe, Home, User, Settings, DollarSign } from 'lucide-react';
import { Page } from './MainLayout';

interface HeaderProps {
  navigateTo: (page: Page) => void;
  currentPage: Page;
}

export default function Header({ navigateTo, currentPage }: HeaderProps) {
  const { t, language, setLanguage } = useLanguage();
  const { user, isAdmin, logout } = useAuth();

  const toggleLanguage = () => {
    setLanguage(language === 'ur' ? 'en' : 'ur');
  };

  return (
    <header className="bg-primary-green text-white border-b-6 border-accent-gold relative">
      <div className="container mx-auto px-4 py-8 flex flex-col items-center space-y-3">
        <div className="text-center max-w-4xl">
          <p className="text-xl md:text-2xl font-urdu opacity-90 mb-2">{t.bismillah}</p>
          <h1 className="text-4xl md:text-6xl font-black urdu-text leading-tight tracking-tight uppercase">{t.jamia_name}</h1>
          <p className="text-sm md:text-base font-medium opacity-80 mt-3 flex flex-wrap justify-center gap-x-4">
            <span>{t.jamia_address}</span>
            <span className="urdu-text hidden md:inline opacity-70">چک نمبر 109 گ ب بجاجانوالہ جڑانوالہ فیصل آباد</span>
          </p>
        </div>

        <div className="w-full flex justify-between items-center pt-6 mt-4 border-t border-white/10">
          <div className="flex space-x-2 rtl:space-x-reverse">
            <button
              onClick={() => navigateTo('home')}
              className={`p-3 rounded-xl transition-all ${currentPage === 'home' ? 'bg-white/20 ring-1 ring-white/50' : 'hover:bg-white/10'}`}
              title={t.home}
            >
              <Home size={20} />
            </button>
            {user && (
              <>
                <button
                  onClick={() => navigateTo('student-dashboard')}
                  className={`p-3 rounded-xl transition-all ${currentPage === 'student-dashboard' ? 'bg-white/20 ring-1 ring-white/50' : 'hover:bg-white/10'}`}
                  title={t.student_panel}
                >
                  <User size={20} />
                </button>
                {isAdmin && (
                  <>
                    <button
                      onClick={() => navigateTo('admin-dashboard')}
                      className={`p-3 rounded-xl transition-all ${currentPage === 'admin-dashboard' ? 'bg-white/20 ring-1 ring-white/50' : 'hover:bg-white/10'}`}
                      title={t.admin_panel}
                    >
                      <Settings size={20} />
                    </button>
                    <button
                      onClick={() => navigateTo('finance')}
                      className={`p-3 rounded-xl transition-all ${currentPage === 'finance' ? 'bg-white/20 ring-1 ring-white/50' : 'hover:bg-white/10'}`}
                      title={t.finance_system}
                    >
                      <DollarSign size={20} />
                    </button>
                  </>
                )}
              </>
            )}
          </div>

          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-2 rtl:space-x-reverse bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full border border-white/20 transition-all text-xs font-black uppercase tracking-widest"
            >
              <Globe size={14} />
              <span>{language === 'ur' ? 'English' : 'اردو'}</span>
            </button>

            {user ? (
              <button
                onClick={logout}
                className="p-3 rounded-xl hover:bg-red-500/30 text-red-100 transition-colors"
                title={t.logout}
              >
                <LogOut size={20} />
              </button>
            ) : (
              <button
                onClick={() => navigateTo('login')}
                className="bg-accent-gold hover:brightness-110 text-white px-6 py-2 rounded-xl transition-all text-sm font-black uppercase tracking-wider"
              >
                {t.login}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
