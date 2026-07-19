import { Shield, AlertTriangle, Building2, BookOpen, Phone, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { RESPONSE_LINKS } from '../config/response-links';
import { useLanguage } from '../hooks/useLanguage';

const ICON_MAP: Record<string, any> = {
  Shield,
  AlertTriangle,
  Building2,
  BookOpen,
  Phone
};

export function ResponseCenter() {
  const { language, t } = useLanguage();

  return (
    <section className="py-16 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 glow-purple inline-block">{t('responseCenter')}</h2>
          <p className="text-muted-foreground text-lg">{t('responseCenterSubtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(RESPONSE_LINKS).map(([key, link], index) => {
            const Icon = ICON_MAP[link.icon] || ExternalLink;
            const title = language === 'ar' ? link.titleAr : link.title;
            const description = language === 'ar' ? link.descriptionAr : link.description;

            return (
              <motion.a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group glass rounded-xl p-6 border border-primary/10 hover:border-primary/30 transition-all duration-300 flex flex-col gap-4 relative overflow-hidden"
              >
                {/* Hover gradient effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:to-transparent transition-colors duration-500" />
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-lg">{title}</h3>
                </div>
                
                <p className="text-muted-foreground relative z-10 flex-grow">
                  {description}
                </p>

                <div className="flex items-center text-primary text-sm font-medium mt-auto relative z-10 group-hover:translate-x-1 transition-transform rtl:group-hover:-translate-x-1">
                  {t('openResource')}
                  <ExternalLink className="h-4 w-4 ml-2 rtl:ml-0 rtl:mr-2" />
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
