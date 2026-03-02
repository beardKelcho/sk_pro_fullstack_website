import axiosInstance from './api/axios';

export interface CaseItem {
    equipment: any; // Mongoose obj populates this, on creation it's just the ID string
    quantity: number;
}

export interface Case {
    _id: string;
    name: string;
    description?: string;
    project?: any;
    items: CaseItem[];
    status: 'PENDING' | 'PROCESSED';
    qrCode: string;
    createdAt: string;
    createdBy?: any;
}

export const createCase = async (caseData: {
    name: string;
    description?: string;
    project?: string;
    items: { equipment: string; quantity: number }[];
}): Promise<Case> => {
    const response = await axiosInstance.post('/cases', caseData);
    return response.data.case;
};

export const getCases = async (): Promise<Case[]> => {
    const response = await axiosInstance.get('/cases');
    return response.data.cases;
};

export const getCaseById = async (id: string): Promise<Case> => {
    const response = await axiosInstance.get(`/cases/${id}`);
    return response.data.case;
};

export const processCaseQR = async (qrCode: string): Promise<Case> => {
    const response = await axiosInstance.post('/cases/process-qr', { qrCode });
    return response.data.case;
};
