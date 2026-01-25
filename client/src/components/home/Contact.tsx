'use client';

import React, { useMemo } from 'react';
import StageExperience, { StageSectionTitle } from '@/components/common/StageExperience';
import { motion } from 'framer-motion';
import Icon from '@/components/common/Icon';
import Map from '@/components/common/Map';
import ContactForm from '@/components/common/ContactForm';
import { useSiteContent, ContactInfo } from '@/hooks/useSiteContent';
import { useTranslations, useLocale } from 'next-intl';

const Contact = () => {
    const { useContent, resolveLocalized } = useSiteContent();
    const { data: contactData } = useContent('contact');
    const contactInfo = contactData?.content as ContactInfo | undefined;
    const tHome = useTranslations('site.home');
    const locale = useLocale();

    const defaultLocation = useMemo(() => ({
        address: 'Zincirlidere Caddesi No:52/C Şişli/İstanbul',
        lat: 41.057984,
        lng: 28.987117,
    }), []);

    const location = useMemo(() => {
        if (!contactInfo) return defaultLocation;
        return {
            address: resolveLocalized(contactInfo.address) || defaultLocation.address,
            lat: contactInfo.latitude || defaultLocation.lat,
            lng: contactInfo.longitude || defaultLocation.lng
        };
    }, [contactInfo, defaultLocation, resolveLocalized]);

    const openMobileNavigation = () => {
        if (typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
            const navigationApps = [
                { name: 'Google Maps', url: `google.navigation:q=${location.lat},${location.lng}` },
                { name: 'Apple Maps', url: `maps://maps.apple.com/?daddr=${location.lat},${location.lng}` },
            ];
            navigationApps.forEach(app => window.open(app.url, '_blank'));
            window.open(`https://www.google.com/maps/place/${encodeURIComponent(location.address)}`, '_blank');
        }
    };

    return (
        <StageExperience>
            <section id="contact" className="relative py-32 bg-gradient-to-b from-black/90 to-black overflow-hidden" style={{ position: 'relative', scrollMarginTop: '100px', marginTop: '6rem', marginBottom: '6rem' }}>
                <div className="container mx-auto px-6">
                    <StageSectionTitle
                        title={tHome('contactSection.title')}
                        subtitle={tHome('contactSection.subtitle')}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <motion.div
                            className="space-y-8"
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            {[
                                { icon: 'location', title: tHome('contactSection.labels.address'), content: resolveLocalized(contactInfo?.address) || tHome('contactSection.fallback.address') },
                                { icon: 'phone', title: tHome('contactSection.labels.phone'), content: contactInfo?.phone || tHome('contactSection.fallback.phone') },
                                { icon: 'email', title: tHome('contactSection.labels.email'), content: contactInfo?.email || tHome('contactSection.fallback.email') },
                            ].map((item, index) => (
                                <motion.div
                                    key={index}
                                    className="flex items-start group"
                                    whileHover={{ x: 10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="bg-gradient-to-br from-[#0066CC] to-[#00C49F] p-4 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                                        <Icon name={item.icon as any} className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                                        <p className="text-gray-300">{item.content}</p>
                                    </div>
                                </motion.div>
                            ))}
                            <Map location={location} onOpenMobileNavigation={openMobileNavigation} />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <ContactForm />
                        </motion.div>
                    </div>
                </div>
            </section>
        </StageExperience>
    );
};

export default Contact;
