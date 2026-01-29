import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from '@/services/api/axios'; // Use our configured axios instance
import { toast } from 'react-toastify';
import { Settings as SettingsIcon, AlertTriangle } from 'lucide-react';

interface MaintenanceToggleProps {
    isMaintenanceMode: boolean;
}

const MaintenanceToggle: React.FC = () => {
    const queryClient = useQueryClient();

    // Fetch maintenance mode status
    const { data: maintenanceData } = useQuery({
        queryKey: ['maintenance-status'],
        queryFn: async () => {
            const res = await axios.get('/public/maintenance');
            return res.data.data;
        },
    });

    const isMaintenanceMode = maintenanceData?.isMaintenanceMode || false;

    // Toggle maintenance mode mutation
    const toggleMaintenanceMutation = useMutation({
        mutationFn: async () => {
            const res = await axios.post('/admin/settings/maintenance/toggle');
            return res.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['maintenance-status'] });
            const newStatus = data.data?.isMaintenanceMode;
            toast.success(newStatus ? 'Bakım modu AÇILDI' : 'Bakım modu KAPATILDI');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Bakım modu güncellenemedi');
        },
    });

    return (
        <div
            onClick={() => toggleMaintenanceMutation.mutate()}
            className={`
                relative p-6 rounded-xl border-2 cursor-pointer
                transition-all duration-300 hover:shadow-xl
                ${isMaintenanceMode
                    ? 'bg-orange-50 border-orange-500 dark:bg-orange-900/20 dark:border-orange-400'
                    : 'bg-green-50 border-green-500 dark:bg-green-900/20 dark:border-green-400'
                }
            `}
        >
            <div className={`mb-4 ${isMaintenanceMode ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}>
                <SettingsIcon className="w-12 h-12" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Bakım Modu
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {isMaintenanceMode
                    ? 'Site şu an bakım modunda - ziyaretçiler erişemiyor'
                    : 'Site normal şekilde çalışıyor'}
            </p>

            {/* Toggle Indicator */}
            <div className="mt-4 flex items-center justify-center">
                <div className={`w-16 h-8 rounded-full relative transition-colors ${isMaintenanceMode ? 'bg-orange-500' : 'bg-green-500'}`}>
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${isMaintenanceMode ? 'translate-x-9' : 'translate-x-1'}`} />
                </div>
            </div>
        </div>
    );
};

export default MaintenanceToggle;
