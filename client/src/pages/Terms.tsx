import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FileText, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Terms = () => {
  const { t } = useTranslation();
  
  const sections = [
    { titleKey: 'acceptanceTitle', contentKey: 'acceptanceContent' },
    { titleKey: 'registrationTitle', contentKey: 'registrationContent' },
    { titleKey: 'ordersTitle', contentKey: 'ordersContent' },
    { titleKey: 'shippingTitle', contentKey: 'shippingContent' },
    { titleKey: 'returnsTitle', contentKey: 'returnsContent' },
    { titleKey: 'intellectualTitle', contentKey: 'intellectualContent' },
    { titleKey: 'disclaimerTitle', contentKey: 'disclaimerContent' },
    { titleKey: 'limitationTitle', contentKey: 'limitationContent' },
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="container px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 mb-4">
              <FileText className="h-8 w-8 text-secondary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">{t('termsTitle')}</h1>
            <p className="text-muted-foreground">
              {t('lastUpdated')}: 23 {t('october')} 2025
            </p>
          </div>

          <Card className="shadow-card mb-8">
            <CardContent className="p-8">
              <p className="text-muted-foreground leading-relaxed">
                {t('termsIntro')}
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
                        <CheckCircle className="h-6 w-6 text-secondary mt-1" />
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
              <h3 className="text-xl font-bold mb-4">{t('changesTitle')}</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {t('changesContent')}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card mt-6">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-4">{t('governingLawTitle')}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('governingLawContent')}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card mt-6">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-4">{t('contactUsTitle2')}</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {t('contactUsIntro')}
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p>{t('email')}: info@nilestore.com</p>
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

export default Terms;
