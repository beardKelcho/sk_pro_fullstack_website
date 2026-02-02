import axios from './api/axios';

export interface InventoryItem {
    _id: string;
    name: string;
    category: { _id: string; name: string; slug: string } | string;
    location: { _id: string; name: string; type: string } | string;
    trackingType: 'SERIALIZED' | 'BULK';
    serialNumber?: string;
    quantity: number;
    status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'RETIRED' | 'MISSING';
    brand?: string;
    model?: string;
    criticalStockLevel: number;
    qrCode?: string;
    createdAt: string;
    updatedAt: string;
    subComponents?: Array<{
        name: string;
        type: string;
        serialNumber?: string;
        specs?: string;
    }>;
}

export interface Category {
    _id: string;
    name: string;
    slug: string;
    parent?: string;
}

export interface Location {
    _id: string;
    name: string;
    type: 'WAREHOUSE' | 'VEHICLE' | 'EVENT_SITE' | 'VIRTUAL';
}

interface ItemParams {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    location?: string;
    status?: string;
}

const inventoryService = {
    // Items
    getItems: async (params: ItemParams) => {
        const response = await axios.get('/inventory/items', { params });
        return response.data;
    },

    createItem: async (data: Partial<InventoryItem>) => {
        const response = await axios.post('/inventory/items', data);
        return response.data;
    },

    getItem: async (id: string) => {
        const response = await axios.get(`/inventory/items/${id}`);
        return response.data;
    },

    updateItem: async (id: string, data: Partial<InventoryItem>) => {
        const response = await axios.put(`/inventory/items/${id}`, data);
        return response.data;
    },

    deleteItem: async (id: string) => {
        const response = await axios.delete(`/inventory/items/${id}`);
        return response.data;
    },

    // Categories & Locations
    getCategories: async () => {
        const response = await axios.get('/inventory/categories');
        return response.data;
    },

    createCategory: async (data: { name: string; parent?: string }) => {
        const response = await axios.post('/inventory/categories', data);
        return response.data;
    },

    updateCategory: async (id: string, data: { name: string; parent?: string }) => {
        const response = await axios.put(`/inventory/categories/${id}`, data);
        return response.data;
    },

    deleteCategory: async (id: string) => {
        const response = await axios.delete(`/inventory/categories/${id}`);
        return response.data;
    },

    getLocations: async () => {
        const response = await axios.get('/inventory/locations');
        return response.data;
    },

    createLocation: async (data: { name: string; type: string; address?: string }) => {
        const response = await axios.post('/inventory/locations', data);
        return response.data;
    },

    // Operations
    assignToProject: async (data: { equipmentId: string; projectId: string; quantity: number }) => {
        const response = await axios.post('/inventory/assign-to-project', data);
        return response.data;
    },

    sendToMaintenance: async (id: string, notes: string) => {
        const response = await axios.post(`/inventory/items/${id}/maintenance`, { notes });
        return response.data;
    },

    returnToWarehouse: async (data: { equipmentId: string; quantity: number }) => {
        const response = await axios.post('/inventory/return-to-warehouse', data);
        return response.data;
    },

    getItemHistory: async (id: string) => {
        const response = await axios.get(`/inventory/history/${id}`);
        return response.data;
    }
};

export default inventoryService;
