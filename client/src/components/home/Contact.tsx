import React from 'react';
import StageExperience, { StageSectionTitle } from '@/components/common/StageExperience';
import Icon from '@/components/common/Icon';
import dynamic from 'next/dynamic';
import { ContactContent } from '@/types/cms';

const ContactForm = dynamic(() => import('@/components/common/ContactForm'), { ssr: false });

interface ContactProps {
    content?: ContactContent;
}

const Contact: React.FC<ContactProps> = ({ content }) => {
    // If no content provided (empty state), return null
    if (!content) {
        return null;
    }

    // Default map coordinates if not provided (Istanbul)
    const lat = content.latitude || 41.0082;
    const lng = content.longitude || 28.9784;

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
                            </div>

                            {/* Map */}
                            <div className="bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 h-[300px]">
                                <iframe
                                    src={`https://www.google.com/maps?q=${lat},${lng}&hl=tr&z=15&output=embed`}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </StageExperience>
    );
};

export default Contact;
