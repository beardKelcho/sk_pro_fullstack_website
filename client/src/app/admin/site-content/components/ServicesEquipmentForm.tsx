import React, { useState, useEffect } from 'react';
import { ServicesEquipmentContent } from '@/hooks/useSiteContent';
import LocalizedInput from '@/components/common/LocalizedInput';

interface Props {
    content: ServicesEquipmentContent | undefined;
    onSave: (data: ServicesEquipmentContent) => void;
    saving: boolean;
}

export default function ServicesEquipmentForm({ content, onSave, saving }: Props) {
    const [formData, setFormData] = useState<ServicesEquipmentContent>({
        title: { tr: '', en: '' },
        subtitle: { tr: '', en: '' },
        services: [],
        equipment: [],
        order: 0,
        ...content
    });

    useEffect(() => {
        if (content) {
            setFormData((prev: ServicesEquipmentContent) => ({ ...prev, ...content }));
        }
    }, [content]);

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
            <h2 className="text-xl font-bold dark:text-white">Hizmetler & Ekipmanlar</h2>

            <LocalizedInput
                label="Başlık"
                value={formData.title}
                onChange={(val) => setFormData({ ...formData, title: val })}
            />

            <LocalizedInput
                label="Alt Başlık"
                value={formData.subtitle}
                onChange={(val) => setFormData({ ...formData, subtitle: val })}
            />

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Not: Hizmet ve Ekipman listesi detaylı düzenleme özellikleri eklenecektir. (Şu an sadece başlıklar düzenlenebilir)
                </p>
            </div>
            <button type="submit" disabled={saving} className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
        </form>
    );
}
