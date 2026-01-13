import React from 'react';
import Icon from './Icon';

interface Equipment {
  name: string;
  description: string;
}

interface EquipmentListProps {
  title: string;
  items: Equipment[];
}

const EquipmentList: React.FC<EquipmentListProps> = ({ title, items }) => {
  return (
    <div className="bg-gray-50 dark:bg-dark-card p-6 rounded-xl border border-gray-200 dark:border-dark-border">
      <h3 className="text-xl font-semibold text-[#0A1128] dark:text-white mb-4">{title}</h3>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex items-start">
            <Icon name="check" className="h-5 w-5 text-[#0066CC] dark:text-primary-light mr-2 mt-0.5" />
            <div>
              <span className="font-medium block dark:text-white">{item.name}</span>
              <span className="text-gray-600 dark:text-gray-300 text-xs">{item.description}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EquipmentList; 