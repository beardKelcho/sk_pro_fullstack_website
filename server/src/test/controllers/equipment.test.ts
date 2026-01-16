import { Request, Response } from 'express';
import * as equipmentController from '../../controllers/equipment.controller';
import { Equipment, QRCode } from '../../models';
import { invalidateEquipmentCache } from '../../middleware/cache.middleware';

// uuid ESM parse hatasını engelle (qrGenerator import zinciri)
jest.mock('uuid', () => ({
  v4: () => 'test-uuid',
}));

jest.mock('../../utils/qrGenerator', () => ({
  generateQRCodeContent: () => 'SKPRO-EQU-TESTCODE',
  generateQRCodeImage: async () => 'data:image/png;base64,TEST',
}));

jest.mock('../../middleware/cache.middleware', () => ({
  invalidateEquipmentCache: jest.fn().mockResolvedValue(undefined),
}));

// Mock mongoose
jest.mock('../../models', () => ({
  Equipment: {
    find: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    updateMany: jest.fn(),
    updateOne: jest.fn(),
    countDocuments: jest.fn(),
  },
  QRCode: {
    create: jest.fn(),
  },
  Project: {
    find: jest.fn(),
    countDocuments: jest.fn(),
  },
}));

describe('Equipment Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockRequest = {
      params: {},
      body: {},
      query: {},
    };
    
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllEquipment', () => {
    it('should return all equipment', async () => {
      const mockEquipment = [
        { _id: '1', name: 'Test Equipment', type: 'VideoSwitcher', status: 'AVAILABLE' },
      ];

      (Equipment.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              populate: jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnValue({
                  lean: jest.fn().mockResolvedValue(mockEquipment),
                }),
              }),
            }),
          }),
        }),
      });

      (Equipment.countDocuments as jest.Mock).mockResolvedValue(1);

      await equipmentController.getAllEquipment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        count: 1,
        total: 1,
        page: 1,
        totalPages: 1,
        equipment: mockEquipment,
      });
    });
  });

  describe('createEquipment', () => {
    it('should create equipment with valid data', async () => {
      const mockEquipment = {
        _id: '1',
        name: 'New Equipment',
        type: 'VideoSwitcher',
        status: 'AVAILABLE',
      };

      mockRequest.body = {
        name: 'New Equipment',
        type: 'VideoSwitcher',
        status: 'AVAILABLE',
      };
      (mockRequest as any).user = { _id: 'u1' };

      (Equipment.create as jest.Mock).mockResolvedValue(mockEquipment);
      (QRCode.create as jest.Mock).mockResolvedValue({ _id: 'q1', code: 'SKPRO-EQU-TESTCODE' });
      (Equipment.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);
      (Equipment.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockEquipment),
      });
      (invalidateEquipmentCache as jest.Mock).mockResolvedValue(undefined);

      await equipmentController.createEquipment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          equipment: expect.anything(),
          qrCode: expect.anything(),
          qrImage: expect.anything(),
        })
      );
    });

    it('should return error if name is missing', async () => {
      mockRequest.body = {
        type: 'VideoSwitcher',
      };

      await equipmentController.createEquipment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Ekipman adı ve tipi gereklidir',
      });
    });
  });
});

