import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Shield, Eye, Lock, Cookie, UserCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const PrivacyPolicy = () => {
  const { t } = useTranslation();
  
  const sections = [
    { icon: UserCheck, titleKey: 'infoCollectionTitle', contentKey: 'infoCollectionContent' },
    { icon: Eye, titleKey: 'infoUsageTitle', contentKey: 'infoUsageContent' },
    { icon: Lock, titleKey: 'dataProtectionTitle', contentKey: 'dataProtectionContent' },
    { icon: Cookie, titleKey: 'cookiesTitle', contentKey: 'cookiesContent' },
    { icon: Shield, titleKey: 'infoSharingTitle', contentKey: 'infoSharingContent' },
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="container px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">{t('privacyTitle')}</h1>
            <p className="text-muted-foreground">
              {t('lastUpdated')}: 23 {t('october')} 2025
            </p>
          </div>

          <Card className="shadow-card mb-8">
            <CardContent className="p-8">
              <p className="text-muted-foreground leading-relaxed mb-6">
                {t('privacyIntro1')}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {t('privacyIntro2')}
              </p>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="shadow-card hover:shadow-card-hover transition-smooth">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                          <section.icon className="h-6 w-6 text-secondary" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-3">{t(section.titleKey)}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {t(section.contentKey)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="shadow-card mt-8">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-4">{t('yourRightsTitle')}</h3>
              <div className="space-y-3 text-muted-foreground">
                <p>• {t('rightAccess')}</p>
                <p>• {t('rightCorrect')}</p>
                <p>• {t('rightDelete')}</p>
                <p>• {t('rightObject')}</p>
                <p>• {t('rightTransfer')}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card mt-6">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-4">{t('contactUsTitle2')}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('privacyContactIntro')}
              </p>
              <div className="mt-4 space-y-2 text-muted-foreground">
                <p>{t('email')}: privacy@nilestore.com</p>
                <p>{t('phone')}: +20 123 456 7890</p>
                <p>{t('address')}: {t('cairoEgypt')}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
