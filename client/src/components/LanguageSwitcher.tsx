import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Props {
  className?: string;
}

const LanguageSwitcher = ({ className = '' }: Props) => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    document.documentElement.setAttribute('dir', newLang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', newLang);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleLanguage}
        className={cn("gap-2 hover:text-blue-800 hover:bg-blue-100", className)}
      >
        <Globe className="h-4 w-4" />
        <span className="text-sm font-medium">
          {i18n.language === 'ar' ? 'English' : 'العربية'}
        </span>
      </Button>
    </motion.div>
  );
};

export default LanguageSwitcher;
