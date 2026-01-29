import React from 'react';
import StageExperience, { StageSectionTitle } from '@/components/common/StageExperience';
import Icon from '@/components/common/Icon';
import { ServicesContent } from '@/types/cms';

interface ServicesProps {
    content?: ServicesContent;
}

const Services: React.FC<ServicesProps> = ({ content }) => {
    // If no content provided (empty state), return null
    if (!content) {
        return null;
    }

    return (
        <StageExperience>
            <section id="services" className="relative py-24 bg-black overflow-hidden" style={{ scrollMarginTop: '100px' }}>
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <StageSectionTitle
                        title={content.title || 'Hizmetlerimiz'}
                        subtitle={content.subtitle || ''}
                    />

                    {/* Services Grid */}
                    {content.services && content.services.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                            {content.services.map((service, index) => (
                                <div
                                    key={index}
                                    className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:border-[#0066CC]/50 transition-all duration-500 hover:shadow-[0_0_40px_rgba(0,102,204,0.15)]"
                                >
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-[#0066CC]/20 to-purple-600/20 mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <Icon name={service.icon as any} className="w-8 h-8 text-[#0066CC]" />
                                    </div>
                                    <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-[#0066CC] transition-colors">
                                        {service.title}
                                    </h3>
                                    <p className="text-gray-400 leading-relaxed">
                                        {service.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </StageExperience>
    );
};

export default Services;
