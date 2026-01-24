export type EquipmentStatus =
    | 'AVAILABLE'
    | 'IN_USE'
    | 'MAINTENANCE'
    | 'DAMAGED'
    | 'RETIRED';

export interface Equipment {
    _id?: string; // MongoDB ID
    id: string;   // Virtual ID or string ID
    name: string;
    model: string;
    serialNumber: string;
    category: string;
    status: EquipmentStatus | string; // Allowing string fallback for now
    purchaseDate?: string;
    price?: number;
    specs?: Record<string, string>;
    location?: string;
    notes?: string;
    qrCode?: string;
    image?: string;
    currentProject?: string | { _id: string; name: string }; // Populated or ID
    responsibleUser?: string | { _id: string; name: string }; // Populated or ID
    createdAt?: string;
    updatedAt?: string;
}

export interface EquipmentForm {
    name: string;
    model: string;
    serialNumber: string;
    category: string;
    status: EquipmentStatus;
    purchaseDate?: string;
    price?: number;
    specs?: Record<string, string>;
    location?: string;
    notes?: string;
}
