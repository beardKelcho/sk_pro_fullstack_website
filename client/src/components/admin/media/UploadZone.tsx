import React, { useCallback, useState } from 'react';
import { UploadCloud, X, File as FileIcon } from 'lucide-react';

interface UploadZoneProps {
    onUpload: (files: File[]) => void;
    isUploading: boolean;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onUpload, isUploading }) => {
    const [isDragActive, setIsDragActive] = useState(false);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragActive(true);
        } else if (e.type === "dragleave") {
            setIsDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setPendingFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setPendingFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeFile = (index: number) => {
        setPendingFiles(prev => prev.filter((_, i) => i !== index));
    };

    const triggerUpload = () => {
        onUpload(pendingFiles);
        setPendingFiles([]);
    };

    return (
        <div className="space-y-4">
            {/* Drop Area */}
            <div
                className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300
          ${isDragActive
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.01]'
                        : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    multiple
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileSelect}
                />

                <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
                    <div className={`p-4 rounded-full ${isDragActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'} transition-colors`}>
                        <UploadCloud size={32} />
                    </div>
                    <div>
                        <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
                            Dosyaları buraya sürükleyin
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            veya seçmek için tıklayın
                        </p>
                    </div>
                </div>
            </div>

            {/* Pending Files List */}
            {pendingFiles.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-gray-700 dark:text-gray-200">
                            Yüklenecek Dosyalar ({pendingFiles.length})
                        </h4>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPendingFiles([])}
                                className="px-3 py-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors"
                            >
                                Temizle
                            </button>
                            <button
                                onClick={triggerUpload}
                                disabled={isUploading}
                                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm flex items-center gap-2"
                            >
                                {isUploading ? 'Yükleniyor...' : 'Yüklemeyi Başlat'}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {pendingFiles.map((file, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg group">
                                <div className="p-2 bg-white dark:bg-gray-600 rounded">
                                    <FileIcon size={16} className="text-blue-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                                <button
                                    onClick={() => removeFile(i)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UploadZone;
