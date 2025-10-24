import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Target, Award, Users, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const About = () => {
  const { t } = useTranslation();
  
  const values = [
    {
      icon: Target,
      titleKey: 'vision',
      descKey: 'visionDesc',
    },
    {
      icon: Award,
      titleKey: 'quality',
      descKey: 'qualityDesc',
    },
    {
      icon: Users,
      titleKey: 'customersFirst',
      descKey: 'customersFirstDesc',
    },
    {
      icon: Heart,
      titleKey: 'trust',
      descKey: 'trustDesc',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="hero-gradient text-primary-foreground py-20">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('aboutUsTitle')}</h1>
            <p className="text-lg text-primary-foreground/90">
              {t('aboutUsSubtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6">{t('ourStory')}</h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {t('storyParagraph1')}
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  {t('storyParagraph2')}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">{t('ourValues')}</h2>
            <p className="text-muted-foreground">{t('valuesPrinciples')}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.titleKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="text-center shadow-card hover:shadow-card-hover transition-smooth">
                  <CardContent className="p-6">
                    <div className="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <value.icon className="h-8 w-8 text-secondary" />
                    </div>
                    <h3 className="font-bold mb-2">{t(value.titleKey)}</h3>
                    <p className="text-sm text-muted-foreground">{t(value.descKey)}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '10k+', labelKey: 'happyCustomers' },
              { value: '5k+', labelKey: 'availableProducts' },
              { value: '50+', labelKey: 'brands' },
              { value: '99%', labelKey: 'customerSatisfaction' },
            ].map((stat, index) => (
              <motion.div
                key={stat.labelKey}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-4xl font-bold text-secondary mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{t(stat.labelKey)}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
