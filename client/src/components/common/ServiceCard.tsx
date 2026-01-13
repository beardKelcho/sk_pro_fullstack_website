import React from 'react';
import Icon from './Icon';

interface ServiceCardProps {
  title: string;
  description: string;
  icon: 'video' | 'screen' | 'led';
}

const ServiceCard: React.FC<ServiceCardProps> = ({ title, description, icon }) => {
  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-2 h-full">
      <div className="h-40 bg-[#0A1128] relative">
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <Icon name={icon} className="h-16 w-16" />
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-3 text-[#0A1128] dark:text-white">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">{description}</p>
      </div>
    </div>
  );
};

export default ServiceCard; 