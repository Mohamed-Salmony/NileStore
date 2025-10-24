'use client';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageWrapper() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Set initial direction and language
    const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    const lang = i18n.language;
    
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang);
  }, [i18n.language]);

  return null;
}
