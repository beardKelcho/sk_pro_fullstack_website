'use client';

import React from 'react';
import StageExperience, { StageSectionTitle } from '@/components/common/StageExperience';
import Icon from '@/components/common/Icon';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import axios from '@/services/api/axios';
import { Loader2, Instagram, Linkedin } from 'lucide-react';

const ContactForm = dynamic(() => import('@/components/common/ContactForm'), { ssr: false });

const Contact: React.FC = () => {
    // Fetch contact data from CMS API
    const { data, isLoading } = useQuery({
        queryKey: ['contact'],
        queryFn: async () => {
            const res = await axios.get('/cms/contact');
            return res.data;
        },
    });

    const content = data?.data;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!content) {
        return null;
    }

    return (
        <StageExperience>
            <section id="contact" className="relative py-24 bg-gradient-to-b from-black to-[#0A1128]/50 overflow-hidden" style={{ scrollMarginTop: '100px' }}>
                <div className="container mx-auto px-6 relative z-10">
                    <StageSectionTitle
                        title="İletişime Geçin"
                        subtitle="Projeleriniz için birlikte çalışalım"
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-16">
                        {/* Contact Form */}
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
                            <ContactForm />
                        </div>

                        {/* Contact Info & Map */}
                        <div className="space-y-8">
                            {/* Contact Details */}
                            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 space-y-6">
                                {content.address && (
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#0066CC]/20 flex items-center justify-center">
                                            <Icon name="location" className="w-6 h-6 text-[#0066CC]" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-white mb-1">Adres</h3>
                                            <p className="text-gray-400">{content.address}</p>
                                        </div>
                                    </div>
                                )}

                                {content.phone && (
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#0066CC]/20 flex items-center justify-center">
                                            <Icon name="phone" className="w-6 h-6 text-[#0066CC]" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-white mb-1">Telefon</h3>
                                            <a href={`tel:${content.phone}`} className="text-gray-400 hover:text-[#0066CC] transition-colors">
                                                {content.phone}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {content.email && (
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#0066CC]/20 flex items-center justify-center">
                                            <Icon name="email" className="w-6 h-6 text-[#0066CC]" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-white mb-1">E-posta</h3>
                                            <a href={`mailto:${content.email}`} className="text-gray-400 hover:text-[#0066CC] transition-colors">
                                                {content.email}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {/* Social Media Links */}
                                {content.socialLinks && (content.socialLinks.instagram || content.socialLinks.linkedin) && (
                                    <div className="pt-4 border-t border-white/10">
                                        <h3 className="text-lg font-semibold text-white mb-4">Sosyal Medya</h3>
                                        <div className="flex gap-4">
                                            {content.socialLinks.instagram && (
                                                <a
                                                    href={content.socialLinks.instagram}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-10 h-10 rounded-lg bg-[#0066CC]/20 flex items-center justify-center hover:bg-[#0066CC]/40 transition-colors"
                                                >
                                                    <Instagram className="w-5 h-5 text-[#0066CC]" />
                                                </a>
                                            )}
                                            {content.socialLinks.linkedin && (
                                                <a
                                                    href={content.socialLinks.linkedin}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-10 h-10 rounded-lg bg-[#0066CC]/20 flex items-center justify-center hover:bg-[#0066CC]/40 transition-colors"
                                                >
                                                    <Linkedin className="w-5 h-5 text-[#0066CC]" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Map */}
                            {content.mapUrl && (
                                <div className="bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 h-[300px]">
                                    <iframe
                                        src={content.mapUrl}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    ></iframe>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </StageExperience>
    );
};

export default Contact;
