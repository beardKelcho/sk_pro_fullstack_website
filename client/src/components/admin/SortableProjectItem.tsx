import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit2, Trash2, Image as ImageIcon, Video } from 'lucide-react';
import Image from 'next/image';

interface SortableProjectItemProps {
    project: any;
    onEdit: (project: any) => void;
    onDelete: (id: string) => void;
}

const SortableProjectItem: React.FC<SortableProjectItemProps> = ({
    project,
    onEdit,
    onDelete,
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: project._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    // Get preview URL based on project type
    const previewUrl = project.type === 'video'
        ? project.videoUrl
        : (project.coverUrl || project.imageUrls?.[0]);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow ${isDragging ? 'z-50 shadow-2xl' : ''
                }`}
        >
            {/* Drag Handle & Type Badge */}
            <div className="flex items-start justify-between mb-4">
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    aria-label="Drag to reorder"
                >
                    <GripVertical className="w-5 h-5 text-gray-400" />
                </button>

                <div className="flex items-center gap-2">
                    {project.type === 'video' ? (
                        <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded text-xs font-semibold text-purple-700 dark:text-purple-400">
                            <Video className="w-3 h-3" />
                            Video
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded text-xs font-semibold text-blue-700 dark:text-blue-400">
                            <ImageIcon className="w-3 h-3" />
                            Galeri
                        </div>
                    )}
                </div>
            </div>

            {/* Preview */}
            <div className="mb-4">
                {previewUrl ? (
                    project.type === 'video' ? (
                        <video
                            src={previewUrl}
                            className="w-full h-40 object-cover rounded-lg"
                            muted
                        />
                    ) : (
                        <div className="relative w-full h-40 rounded-lg overflow-hidden">
                            <Image
                                src={previewUrl}
                                alt={project.title || 'Project Preview'}
                                fill
                                sizes="(max-width: 768px) 100vw, 300px"
                                className="object-cover"
                            />
                        </div>
                    )
                ) : (
                    <div className="w-full h-40 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400">No preview</span>
                    </div>
                )}
            </div>

            {/* Title & Category */}
            <div className="mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                    {project.title}
                </h3>
                <span className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold">
                    {project.category}
                </span>
            </div>

            {/* Media Count Info */}
            {project.type === 'photo' && project.imageUrls && project.imageUrls.length > 0 && (
                <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-blue-500" />
                        <span>{project.imageUrls.length} fotoğraf</span>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onEdit(project)}
                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                    <Edit2 className="w-4 h-4" />
                    Düzenle
                </button>
                <button
                    onClick={() => {
                        if (confirm('Bu projeyi silmek istediğinizden emin misiniz?')) {
                            onDelete(project._id);
                        }
                    }}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default SortableProjectItem;
