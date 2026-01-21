'use client';

import React, { useState, useEffect, useMemo } from 'react';
import StageExperience, { StageSectionTitle } from '@/components/common/StageExperience';
import { motion } from 'framer-motion';
import Icon from '@/components/common/Icon';
import Map from '@/components/common/Map';
import ContactForm from '@/components/common/ContactForm';
import { ContactInfo } from '@/services/siteContentService';
import { useTranslations } from 'next-intl';
import logger from '@/utils/logger';

const Contact = () => {
    const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
    const tHome = useTranslations('site.home');

    useEffect(() => {
        const fetchContact = async () => {
            try {
                const response = await fetch('/api/site-content/public/contact', { headers: { 'Cache-Control': 'no-cache' } });
                if (response.ok) {
                    const data = await response.json();
                    if (data.content?.content) setContactInfo(data.content.content);
                }
            } catch (e) { logger.error(e); }
        };
        fetchContact();
    }, []);

    const defaultLocation = useMemo(() => ({
        address: 'Zincirlidere Caddesi No:52/C Şişli/İstanbul',
        lat: 41.057984,
        lng: 28.987117,
    }), []);

    const location = useMemo(() => {
        if (!contactInfo) return defaultLocation;
        return {
            address: contactInfo.address,
            lat: contactInfo.latitude || defaultLocation.lat,
            lng: contactInfo.longitude || defaultLocation.lng
        };
    }, [contactInfo, defaultLocation]);

    const openMobileNavigation = () => {
        if (typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
            const navigationApps = [
                { name: 'Google Maps', url: `google.navigation:q=${location.lat},${location.lng}` },
                { name: 'Apple Maps', url: `maps://maps.apple.com/?daddr=${location.lat},${location.lng}` },
            ];
            navigationApps.forEach(app => window.open(app.url, '_blank'));
        } else {
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
                                { icon: 'location', title: tHome('contactSection.labels.address'), content: contactInfo?.address || tHome('contactSection.fallback.address') },
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
