'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCases, Case } from '@/services/caseService';
import { toast } from 'react-toastify';
import QRCodePrintModal from '@/components/admin/QRCodePrintModal';

export default function CasesPage() {
    const [cases, setCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCase, setSelectedCase] = useState<Case | null>(null);
    const [showQRModal, setShowQRModal] = useState(false);

    useEffect(() => {
        fetchCases();
    }, []);

    const fetchCases = async () => {
        try {
            setLoading(true);
            const data = await getCases();
            setCases(data);
        } catch (error) {
            toast.error('Kasalar yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handlePrintQR = (c: Case) => {
        setSelectedCase(c);
        setShowQRModal(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Kasa Yönetimi</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Projeler için hazırlanan hazır ekipman kasalarını yönetin.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/admin/cases/add">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                            Yeni Kasa Ekle
                        </button>
                    </Link>
                </div>
            </div>

            {/* Case List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kasa Adı</th>
                                <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Proje</th>
                                <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">İçerik</th>
                                <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Durum</th>
                                <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">QR Kod</th>
                                <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">Yükleniyor...</td>
                                </tr>
                            ) : cases.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">Henüz hiç kasa oluşturulmamış.</td>
                                </tr>
                            ) : (
                                cases.map((c) => (
                                    <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="font-medium text-gray-900 dark:text-white">{c.name}</div>
                                            {c.description && <div className="text-xs text-gray-500 dark:text-gray-400">{c.description}</div>}
                                        </td>
                                        <td className="py-3 px-4">
                                            {c.project ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                                                    {c.project.name}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-sm">Atanmadı</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                                {c.items.length} çeşit ekipman
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            {c.status === 'PROCESSED' ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                    İşlendi / Çıkış Yapıldı
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                    Bekliyor
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                                                {c.qrCode}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <button
                                                onClick={() => handlePrintQR(c)}
                                                className="p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors tooltip tooltip-left"
                                                data-tip="QR Kod Yazdır"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* QR Modal */}
            <QRCodePrintModal
                isOpen={showQRModal}
                onClose={() => setShowQRModal(false)}
                qrCode={selectedCase?.qrCode || ''}
                entityName={selectedCase?.name}
                entityType="Kasa"
            />
        </div>
    );
}
