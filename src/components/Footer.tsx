import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-ink-black text-slate-400 py-10 mt-auto border-t-4 border-accent-gold">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left rtl:md:text-right">
          <p className="text-sm font-bold text-white mb-1">
            Powered by <span className="text-accent-gold">Barvi Graphics Faisalabad</span>
          </p>
          <p className="text-xs opacity-60 urdu-text">{t.footer}</p>
        </div>
        
        <div className="flex flex-col items-center md:items-end gap-3">
          <a
            href="https://share.google/YhQGYyA6qsLBTY0m6"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-black uppercase tracking-widest text-slate-200 hover:text-accent-gold underline underline-offset-8 decoration-accent-gold/40 transition-all"
          >
            Connect on Share
          </a>
          <div className="text-[10px] opacity-40 font-mono">
            &copy; {new Date().getFullYear()} JAMIA NAQSHBANDIA BARVI RAZVIA
          </div>
        </div>
      </div>
    </footer>
  );
}
