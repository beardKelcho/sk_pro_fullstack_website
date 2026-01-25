import React, { useState, useEffect } from 'react';
import { FooterContent } from '@/hooks/useSiteContent';
import LocalizedInput from '@/components/common/LocalizedInput';

interface FooterFormProps {
    content: FooterContent | undefined;
    onSave: (data: FooterContent) => void;
    saving: boolean;
}

export default function FooterForm({ content, onSave, saving }: FooterFormProps) {
    const [formData, setFormData] = useState<FooterContent>({
        aboutText: { tr: '', en: '' },
        copyrightText: { tr: '', en: '' },
        quickLinks: [],
        ...content
    });

    useEffect(() => {
        if (content) {
            setFormData(prev => ({ ...prev, ...content }));
        }
    }, [content]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Footer Ayarları</h2>

            <LocalizedInput
                label="Footer Hakkında Metni"
                value={formData.aboutText}
                onChange={(val) => setFormData({ ...formData, aboutText: val })}
                type="textarea"
            />

            <LocalizedInput
                label="Copyright Metni"
                value={formData.copyrightText}
                onChange={(val) => setFormData({ ...formData, copyrightText: val })}
            />

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </button>
            </div>
        </form>
    );
}
