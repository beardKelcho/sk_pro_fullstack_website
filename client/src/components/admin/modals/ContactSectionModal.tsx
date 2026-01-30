import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import axios from '@/services/api/axios';
import { toast } from 'react-toastify';
import { X, Save, Loader2, MapPin, Phone, Mail, Instagram, Linkedin, Youtube } from 'lucide-react';

interface ContactSectionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ContactForm {
    address: string;
    phone: string;
    email: string;
    mapUrl: string;
    socialLinks: {
        instagram: string;
        linkedin: string;
        youtube: string;
    };
}

const ContactSectionModal: React.FC<ContactSectionModalProps> = ({ isOpen, onClose }) => {
    const queryClient = useQueryClient();

    // Form state
    const [formData, setFormData] = useState<ContactForm>({
        address: '',
        phone: '',
        email: '',
        mapUrl: '',
        socialLinks: {
            instagram: '',
            linkedin: '',
            youtube: ''
        }
    });

    // Fetch current contact data
    const { data: contactData, isLoading } = useQuery({
        queryKey: ['admin-contact'],
        queryFn: async () => {
            const res = await axios.get('/cms/contact');
            return res.data;
        },
        enabled: isOpen,
    });

    // Load data into form when available
    useEffect(() => {
        if (contactData?.data) {
            setFormData({
                address: contactData.data.address || '',
                phone: contactData.data.phone || '',
                email: contactData.data.email || '',
                mapUrl: contactData.data.mapUrl || '',
                socialLinks: {
                    instagram: contactData.data.socialLinks?.instagram || '',
                    linkedin: contactData.data.socialLinks?.linkedin || '',
                    youtube: contactData.data.socialLinks?.youtube || ''
                }
            });
        }
    }, [contactData]);

    // Save mutation
    const saveContactMutation = useMutation({
        mutationFn: async (data: ContactForm) => {
            const res = await axios.put('/cms/contact', data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-contact'] });
            queryClient.invalidateQueries({ queryKey: ['contact'] }); // Public query
            queryClient.invalidateQueries({ queryKey: ['footer-contact'] }); // Footer query
            toast.success('İletişim bilgileri güncellendi');
            onClose();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Kaydetme hatası');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.address || !formData.phone || !formData.email || !formData.mapUrl) {
            toast.error('Tüm iletişim bilgileri zorunludur');
            return;
        }
        saveContactMutation.mutate(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        İletişim Yönetimi
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Contact Info Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    İletişim Bilgileri
                                </h3>

                                {/* Address */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Adres *
                                    </label>
                                    <textarea
                                        required
                                        value={formData.address}
                                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                        rows={3}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                        placeholder="Örn: Şişli, İstanbul, Türkiye"
                                    />
                                </div>

                                {/* Phone & Email */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Telefon *
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="+90 XXX XXX XX XX"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            E-posta *
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="info@example.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Map Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Google Maps Haritası
                                </h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Harita Embed URL *
                                    </label>
                                    <input
                                        type="url"
                                        required
                                        value={formData.mapUrl}
                                        onChange={(e) => setFormData(prev => ({ ...prev, mapUrl: e.target.value }))}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="https://www.google.com/maps/embed?pb=..."
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Google Maps&apos;ten &quot;Share&quot; → &quot;Embed a map&quot; → &quot;COPY HTML&quot; içindeki src URL&apos;sini yapıştırın
                                    </p>
                                </div>

                                {/* Map Preview */}
                                {formData.mapUrl && (
                                    <div className="mt-3">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Önizleme:
                                        </p>
                                        <iframe
                                            src={formData.mapUrl}
                                            className="w-full h-64 rounded-lg border border-gray-300 dark:border-gray-600"
                                            allowFullScreen
                                            loading="lazy"
                                            title="Harita Önizleme"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Social Media Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Sosyal Medya Linkleri
                                </h3>

                                <div className="space-y-3">
                                    {/* Instagram */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                            <Instagram className="w-4 h-4" />
                                            Instagram
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.socialLinks.instagram}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                socialLinks: { ...prev.socialLinks, instagram: e.target.value }
                                            }))}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="https://instagram.com/username"
                                        />
                                    </div>

                                    {/* LinkedIn */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                            <Linkedin className="w-4 h-4" />
                                            LinkedIn
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.socialLinks.linkedin}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                                            }))}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="https://linkedin.com/company/companyname"
                                        />
                                    </div>

                                    {/* YouTube */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                            <Youtube className="w-4 h-4" />
                                            YouTube
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.socialLinks.youtube}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                socialLinks: { ...prev.socialLinks, youtube: e.target.value }
                                            }))}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="https://youtube.com/@channelname"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={saveContactMutation.isPending}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    {saveContactMutation.isPending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Kaydediliyor...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Kaydet
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContactSectionModal;
