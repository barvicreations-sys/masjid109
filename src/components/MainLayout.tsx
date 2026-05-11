import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Header from './Header';
import Footer from './Footer';
import Home from '../pages/Home';
import Login from '../pages/Login';
import StudentDashboard from '../pages/StudentDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import FinanceDashboard from '../pages/FinanceDashboard';
import ProfileDetail from '../pages/ProfileDetail';

export type Page = 'home' | 'login' | 'student-dashboard' | 'admin-dashboard' | 'finance' | 'profile-detail';

export default function MainLayout() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const { user, isAdmin, loading } = useAuth();
  const { isRTL } = useLanguage();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700"></div>
      </div>
    );
  }

  const navigateTo = (page: Page, profileId?: string) => {
    setCurrentPage(page);
    if (profileId) setSelectedProfile(profileId);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home navigateTo={navigateTo} />;
      case 'login':
        return <Login navigateTo={navigateTo} />;
      case 'student-dashboard':
        return <StudentDashboard />;
      case 'admin-dashboard':
        return <AdminDashboard navigateTo={navigateTo} />;
      case 'finance':
        return <FinanceDashboard />;
      case 'profile-detail':
        return <ProfileDetail profileId={selectedProfile} onBack={() => navigateTo('home')} />;
      default:
        return <Home navigateTo={navigateTo} />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col bg-paper-white text-ink-black font-sans ${isRTL ? 'urdu-text' : ''}`}>
      <Header navigateTo={navigateTo} currentPage={currentPage} />
      <main className="flex-grow container mx-auto px-4 py-12">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
}
