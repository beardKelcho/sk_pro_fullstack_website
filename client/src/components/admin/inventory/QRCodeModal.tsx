import React from 'react';
import { InventoryItem } from '@/services/inventoryService';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import InventoryLabel from './InventoryLabel';

interface QRCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: InventoryItem | null;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, item }) => {
    if (!isOpen || !item) return null;

    const qrValue = JSON.stringify({
        id: item._id,
        name: item.name
    });

    const handlePrint = () => {
        window.print();
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm print:bg-white print:p-0">
                {/* Screen View */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm overflow-hidden print:hidden"
                >
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">QR Kod</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                            ✕
                        </button>
                    </div>

                    <div className="p-8 flex flex-col items-center text-center">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {item.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                                {item.serialNumber || item._id}
                            </p>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-100">
                            <QRCodeSVG
                                value={qrValue}
                                size={200}
                                level="H"
                                includeMargin={true}
                            />
                        </div>

                        <div className="mt-6 w-full">
                            <button
                                onClick={handlePrint}
                                className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2-2v4h10z" />
                                </svg>
                                Yazdır
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Print View - Hidden on screen, Visible on print */}
                <div className="hidden print:flex print:fixed print:inset-0 print:items-center print:justify-center bg-white">
                    <InventoryLabel
                        serialNumber={item.serialNumber || item._id}
                        inventoryName={item.name}
                        brand={item.brand}
                        qrData={qrValue}
                    />
                </div>

                {/* Global Print Styles */}
                <style jsx global>{`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        .fixed, .fixed * {
                            visibility: visible;
                        }
                        .fixed {
                            position: fixed;
                            left: 0;
                            top: 0;
                            width: 100%;
                            height: 100%;
                            background: white;
                            padding: 0;
                            margin: 0;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        }
                        /* Hide the screen modal specifically */
                        .print\\:hidden {
                            display: none !important;
                        }
                    }
                `}</style>
            </div>
        </AnimatePresence>
    );
};

export default QRCodeModal;
