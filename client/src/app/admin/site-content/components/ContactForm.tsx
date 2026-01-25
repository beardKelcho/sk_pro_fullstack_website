import React, { useState, useEffect } from 'react';
import { ContactInfo } from '@/hooks/useSiteContent';
import LocalizedInput from '@/components/common/LocalizedInput';

interface ContactFormProps {
    content: ContactInfo | undefined;
    onSave: (data: ContactInfo) => void;
    saving: boolean;
}

export default function ContactForm({ content, onSave, saving }: ContactFormProps) {
    const [formData, setFormData] = useState<ContactInfo>({
        details: { tr: '', en: '' },
        address: { tr: '', en: '' },
        email: '',
        phone: '',
        mapUrl: '',
        whatsapp: '',
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
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">İletişim Bilgileri</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <LocalizedInput
                        label="İletişim Başlığı / Detayı"
                        value={formData.details}
                        onChange={(val) => setFormData({ ...formData, details: val })}
                    />

                    <LocalizedInput
                        label="Adres"
                        value={formData.address}
                        onChange={(val) => setFormData({ ...formData, address: val })}
                        type="textarea"
                    />
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-posta</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefon</label>
                        <input
                            type="text"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">WhatsApp No (Örn: 90532...)</label>
                        <input
                            type="text"
                            value={formData.whatsapp}
                            onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Google Maps Embed URL</label>
                <input
                    type="text"
                    value={formData.mapUrl}
                    onChange={e => setFormData({ ...formData, mapUrl: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xs"
                    placeholder="https://www.google.com/maps/embed?..."
                />
                <p className="text-xs text-gray-500 mt-1">Google Maps'ten 'Haritayı yerleştir' seçeneğindeki src linkini yapıştırın.</p>
            </div>

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
