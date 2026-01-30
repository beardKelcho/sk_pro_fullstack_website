import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit2, Trash2 } from 'lucide-react';

interface SortableServiceItemProps {
    service: any;
    onEdit: (service: any) => void;
    onDelete: (id: string) => void;
    getIconComponent: (iconName: string) => React.ComponentType<{ className?: string }>;
}

const SortableServiceItem: React.FC<SortableServiceItemProps> = ({
    service,
    onEdit,
    onDelete,
    getIconComponent,
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: service._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const IconComponent = getIconComponent(service.icon);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow ${isDragging ? 'z-50 shadow-2xl' : ''
                }`}
        >
            {/* Drag Handle - Top Left Corner */}
            <div className="flex items-start gap-4 mb-4">
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    aria-label="Drag to reorder"
                >
                    <GripVertical className="w-5 h-5 text-gray-400" />
                </button>

                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-600/20 flex items-center justify-center">
                    <IconComponent className="w-6 h-6 text-cyan-400" />
                </div>

                <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                        {service.title}
                    </h3>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                        {service.category}
                    </span>
                </div>
            </div>

            {/* Details Preview */}
            {service.details && service.details.length > 0 && (
                <div className="mb-4 text-sm text-gray-600 dark:text-gray-300 ml-9">
                    <div className="space-y-1">
                        {service.details.slice(0, 3).map((detail: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-2">
                                <span className="text-cyan-400 mt-1">▸</span>
                                <span className="line-clamp-1">{detail}</span>
                            </div>
                        ))}
                        {service.details.length > 3 && (
                            <div className="text-xs text-gray-500">
                                +{service.details.length - 3} daha...
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 ml-9">
                <button
                    onClick={() => onEdit(service)}
                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                    <Edit2 className="w-4 h-4" />
                    Düzenle
                </button>
                <button
                    onClick={() => {
                        if (confirm('Bu hizmeti silmek istediğinizden emin misiniz?')) {
                            onDelete(service._id);
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

export default SortableServiceItem;
