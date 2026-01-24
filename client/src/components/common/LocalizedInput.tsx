import React, { useState } from 'react';
import { LocalizedString } from '@/services/siteContentService';

interface LocalizedInputProps {
    label: string;
    value: LocalizedString;
    onChange: (value: LocalizedString) => void;
    placeholder?: string;
    type?: 'text' | 'textarea';
}

export default function LocalizedInput({ label, value, onChange, placeholder, type = 'text' }: LocalizedInputProps) {
    const [lang, setLang] = useState<'tr' | 'en'>('tr');

    const handleChange = (text: string) => {
        onChange({ ...value, [lang]: text });
    };

    return (
        <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                <div className="flex space-x-2 text-xs">
                    <button
                        type="button"
                        onClick={() => setLang('tr')}
                        className={`px-2 py-1 rounded ${lang === 'tr' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                    >
                        TR
                    </button>
                    <button
                        type="button"
                        onClick={() => setLang('en')}
                        className={`px-2 py-1 rounded ${lang === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                    >
                        EN
                    </button>
                </div>
            </div>
            {type === 'textarea' ? (
                <textarea
                    value={value?.[lang] || ''}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder={`${placeholder || ''} (${lang.toUpperCase()})`}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                />
            ) : (
                <input
                    type="text"
                    value={value?.[lang] || ''}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder={`${placeholder || ''} (${lang.toUpperCase()})`}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                />
            )}
        </div>
    );
}
