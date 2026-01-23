import React from 'react';
import Icon from './Icon';

interface ServiceCardProps {
  title: string;
  description: string;
  icon: 'video' | 'screen' | 'led';
}

const ServiceCard: React.FC<ServiceCardProps> = ({ title, description, icon }) => {
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center h-full transition-all duration-300 hover:bg-white/10 hover:-translate-y-2 group">
      <div className="mb-6 p-4 bg-[#0066CC]/10 rounded-full group-hover:bg-[#0066CC]/20 transition-colors">
        <Icon name={icon} className="h-12 w-12 text-[#0066CC]" />
      </div>
      <h3 className="text-xl font-bold mb-4 text-white">{title}</h3>
      <p className="text-gray-300 leading-relaxed text-sm">{description}</p>
    </div>
  );
};

export default ServiceCard; 