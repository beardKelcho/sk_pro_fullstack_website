import { useState, useEffect, useCallback } from 'react';
import { Equipment, EquipmentStatus } from '@/types/equipment';
import { getAllEquipment, deleteEquipment, updateEquipment } from '@/services/equipmentService';
import { toast } from 'react-toastify';
import logger from '@/utils/logger';
import { MESSAGES } from '@/constants/messages';

// Helper to normalize backend data to frontend type
const normalizeEquipment = (item: any): Equipment => {
    // Determine status - map backend status to strictly typed EquipmentStatus
    let status: EquipmentStatus = 'AVAILABLE';
    const rawStatus = String(item.status || '').toUpperCase();

    if (rawStatus === 'IN_USE' || rawStatus === 'INUSE') status = 'IN_USE';
    else if (rawStatus === 'MAINTENANCE') status = 'MAINTENANCE';
    else if (rawStatus === 'DAMAGED' || rawStatus === 'BROKEN') status = 'DAMAGED';
    else if (rawStatus === 'RETIRED') status = 'RETIRED';

    return {
        id: item._id || item.id || '',
        _id: item._id,
        name: item.name || '',
        model: item.model || '',
        serialNumber: item.serialNumber || '',
        category: item.type || item.category || 'Accessory',
        status: status,
        location: item.location || '',
        purchaseDate: item.purchaseDate,
        currentProject: typeof item.currentProject === 'object' ? item.currentProject?.name : item.currentProject,
        notes: item.notes,
        specs: item.specs,
        // Add other fields as necessary matching the type
    };
};

export const useEquipment = () => {
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEquipment = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAllEquipment();
            const rawList = response.equipment || response;
            const list = Array.isArray(rawList) ? rawList : [];

            const formatted = list.map(normalizeEquipment);
            setEquipment(formatted);
        } catch (err: unknown) {
            logger.error('Ekipman yükleme hatası:', err);
            setError('Ekipman verileri alınamadı.'); // Could use MESSAGES constant if available
            toast.error('Ekipman verileri alınamadı.');
        } finally {
            setLoading(false);
        }
    }, []);

    const removeEquipment = async (id: string): Promise<boolean> => {
        try {
            await deleteEquipment(id);
            setEquipment(prev => prev.filter(item => item.id !== id));
            toast.success('Ekipman başarıyla silindi');
            return true;
        } catch (err: unknown) {
            logger.error('Ekipman silme hatası:', err);
            toast.error('Ekipman silinirken bir hata oluştu');
            return false;
        }
    };

    const updateStatus = async (id: string, newStatus: EquipmentStatus): Promise<boolean> => {
        const oldItem = equipment.find(e => e.id === id);
        if (!oldItem) return false;

        // Optimistic update
        setEquipment(prev => prev.map(item =>
            item.id === id ? { ...item, status: newStatus } : item
        ));

        try {
            // Backend expects specific string probably
            await updateEquipment(id, { status: newStatus });
            toast.success('Ekipman durumu güncellendi');
            return true;
        } catch (err: unknown) {
            logger.error('Status update error:', err);
            // Revert
            setEquipment(prev => prev.map(item =>
                item.id === id ? oldItem : item
            ));
            toast.error('Durum güncellenemedi');
            return false;
        }
    };

    useEffect(() => {
        fetchEquipment();
    }, [fetchEquipment]);

    return {
        equipment,
        loading,
        error,
        refresh: fetchEquipment,
        removeEquipment,
        updateStatus,
    };
};
